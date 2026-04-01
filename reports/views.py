from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Avg
from django.utils import timezone
from django.http import HttpResponse, FileResponse
from django.core.cache import cache
from typing import Dict, Any, List
import io
import pandas as pd
from datetime import datetime, timedelta

from .models import (
    ReportCategory, ReportTemplate, ReportExecution,
    ReportSchedule, ReportBookmark
)
from .serializers import (
    ReportCategorySerializer, ReportTemplateListSerializer,
    ReportTemplateDetailSerializer, ReportTemplateCreateUpdateSerializer,
    ReportExecutionSerializer, ReportExecutionCreateSerializer,
    ReportScheduleSerializer, ReportBookmarkSerializer,
    DashboardSummarySerializer, ReportFilterSerializer,
    ReportExportSerializer
)
from .services import ReportService, ExportService, CacheService

User = get_user_model()


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for report views"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ReportCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing report categories"""

    queryset = ReportCategory.objects.filter(is_active=True)
    serializer_class = ReportCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """Filter categories based on user permissions"""
        queryset = super().get_queryset()

        # Only RH and Admin can see all categories
        if self.request.user.role not in ['admin', 'rh']:
            # Filter categories that have public reports or reports user can access
            queryset = queryset.filter(
                Q(reporttemplate__is_public=True) |
                Q(reporttemplate__allowed_users=self.request.user) |
                Q(reporttemplate__allowed_roles__contains=self.request.user.role)
            ).distinct()

        return queryset


class ReportTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing report templates"""

    queryset = ReportTemplate.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ReportTemplateListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ReportTemplateCreateUpdateSerializer
        else:
            return ReportTemplateDetailSerializer

    def get_queryset(self):
        """Filter templates based on user permissions"""
        queryset = super().get_queryset()

        # Filter based on user access
        user = self.request.user
        if user.role in ['admin', 'rh']:
            # Admin and RH can see all templates
            pass
        else:
            # Filter templates user can access
            queryset = queryset.filter(
                Q(is_public=True) |
                Q(created_by=user) |
                Q(allowed_users=user) |
                Q(allowed_roles__contains=user.role)
            ).distinct()

        # Additional filters
        report_type = self.request.query_params.get('report_type')
        if report_type:
            queryset = queryset.filter(report_type=report_type)

        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)

        return queryset

    def perform_create(self, serializer):
        """Set created_by when creating template"""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Execute a report template"""
        template = self.get_object()

        # Check if user can access this template
        if not template.can_access(request.user):
            return Response(
                {'error': 'You do not have permission to execute this report'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Create execution record
        execution_data = {
            'template': template.id,
            'parameters': request.data.get('parameters', {}),
            'output_format': request.data.get('format', template.default_format)
        }

        execution_serializer = ReportExecutionCreateSerializer(
            data=execution_data,
            context={'request': request}
        )

        if execution_serializer.is_valid():
            execution = execution_serializer.save()

            # Start execution asynchronously (in a real app, use Celery)
            try:
                report_service = ReportService()
                result = report_service.execute_report(execution)

                return Response({
                    'execution_id': str(execution.id),
                    'status': execution.status,
                    'message': 'Report execution started successfully'
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                execution.fail_execution(str(e))
                return Response(
                    {'error': f'Failed to execute report: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response(
            execution_serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def bookmark(self, request, pk=None):
        """Bookmark a report template"""
        template = self.get_object()

        bookmark_data = {
            'template': template.id,
            'name': request.data.get('name', ''),
            'parameters': request.data.get('parameters', {})
        }

        bookmark_serializer = ReportBookmarkSerializer(
            data=bookmark_data,
            context={'request': request}
        )

        if bookmark_serializer.is_valid():
            bookmark_serializer.save()
            return Response(
                bookmark_serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            bookmark_serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ReportExecutionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing report executions"""

    queryset = ReportExecution.objects.all()
    serializer_class = ReportExecutionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """Filter executions based on user permissions"""
        queryset = super().get_queryset()

        user = self.request.user
        if user.role not in ['admin', 'rh']:
            # Users can only see their own executions
            queryset = queryset.filter(executed_by=user)

        # Filter by template
        template_id = self.request.query_params.get('template')
        if template_id:
            queryset = queryset.filter(template_id=template_id)

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset.order_by('-created_at')

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download execution result file"""
        execution = self.get_object()

        # Check permissions
        if (execution.executed_by != request.user and
            request.user.role not in ['admin', 'rh']):
            return Response(
                {'error': 'You do not have permission to download this file'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if file exists and is not expired
        if not execution.file_path:
            return Response(
                {'error': 'No file available for download'},
                status=status.HTTP_404_NOT_FOUND
            )

        if execution.is_expired:
            return Response(
                {'error': 'File has expired'},
                status=status.HTTP_410_GONE
            )

        try:
            # Return file response
            response = FileResponse(
                open(execution.file_path, 'rb'),
                as_attachment=True,
                filename=f"report_{execution.template.name}_{execution.created_at.strftime('%Y%m%d_%H%M%S')}.{execution.output_format}"
            )
            return response

        except FileNotFoundError:
            return Response(
                {'error': 'File not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a running execution"""
        execution = self.get_object()

        # Check permissions
        if (execution.executed_by != request.user and
            request.user.role not in ['admin', 'rh']):
            return Response(
                {'error': 'You do not have permission to cancel this execution'},
                status=status.HTTP_403_FORBIDDEN
            )

        if execution.status not in ['pending', 'running']:
            return Response(
                {'error': 'Cannot cancel execution in current status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        execution.status = ReportExecution.StatusChoices.CANCELLED
        execution.save(update_fields=['status', 'updated_at'])

        return Response({'message': 'Execution cancelled successfully'})


class ReportScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing report schedules"""

    queryset = ReportSchedule.objects.all()
    serializer_class = ReportScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """Filter schedules based on user permissions"""
        queryset = super().get_queryset()

        user = self.request.user
        if user.role not in ['admin', 'rh']:
            # Users can only see their own schedules
            queryset = queryset.filter(created_by=user)

        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause a schedule"""
        schedule = self.get_object()

        if schedule.status == ReportSchedule.StatusChoices.ACTIVE:
            schedule.status = ReportSchedule.StatusChoices.PAUSED
            schedule.save(update_fields=['status', 'updated_at'])

            return Response({'message': 'Schedule paused successfully'})

        return Response(
            {'error': 'Schedule is not in active status'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume a paused schedule"""
        schedule = self.get_object()

        if schedule.status == ReportSchedule.StatusChoices.PAUSED:
            schedule.status = ReportSchedule.StatusChoices.ACTIVE
            schedule.next_execution = schedule.calculate_next_execution()
            schedule.save(update_fields=['status', 'next_execution', 'updated_at'])

            return Response({'message': 'Schedule resumed successfully'})

        return Response(
            {'error': 'Schedule is not paused'},
            status=status.HTTP_400_BAD_REQUEST
        )


class ReportBookmarkViewSet(viewsets.ModelViewSet):
    """ViewSet for managing report bookmarks"""

    queryset = ReportBookmark.objects.all()
    serializer_class = ReportBookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """Get user's bookmarks"""
        return super().get_queryset().filter(user=self.request.user)


class DashboardViewSet(viewsets.GenericViewSet):
    """ViewSet for dashboard data and summary reports"""

    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get dashboard summary data"""
        cache_key = f"dashboard_summary_{request.user.id}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        try:
            # Import models here to avoid circular imports
            from employees.models import Employee
            from termination.models import TerminationRequest
            from leave_requests.models import LeaveRequest
            from evaluations.models import PerformanceEvaluation

            # Calculate summary statistics
            summary_data = {
                'total_employees': Employee.objects.count(),
                'active_employees': Employee.objects.filter(status='active').count(),
                'pending_admissions': Employee.objects.filter(status='pending').count(),
                'recent_terminations': TerminationRequest.objects.filter(
                    created_at__gte=timezone.now() - timedelta(days=30)
                ).count(),
                'pending_leave_requests': LeaveRequest.objects.filter(
                    status='pendente'
                ).count(),
                'pending_evaluations': PerformanceEvaluation.objects.filter(
                    status='draft'
                ).count(),
            }

            # Employees by department
            dept_data = Employee.objects.values('department').annotate(
                count=Count('id')
            ).order_by('-count')[:10]

            summary_data['employees_by_department'] = [
                {'department': item['department'] or 'Não informado', 'count': item['count']}
                for item in dept_data
            ]

            # Terminations by month (last 6 months)
            six_months_ago = timezone.now() - timedelta(days=180)
            term_data = TerminationRequest.objects.filter(
                created_at__gte=six_months_ago
            ).extra(
                select={'month': "DATE_FORMAT(created_at, '%%Y-%%m')"}
            ).values('month').annotate(
                count=Count('id')
            ).order_by('month')

            summary_data['terminations_by_month'] = [
                {'month': item['month'], 'count': item['count']}
                for item in term_data
            ]

            # Leave requests by status
            leave_data = LeaveRequest.objects.values('status').annotate(
                count=Count('id')
            )

            summary_data['leave_requests_by_status'] = [
                {'status': item['status'], 'count': item['count']}
                for item in leave_data
            ]

            # Recent activities (simplified)
            summary_data['recent_activities'] = []

            # Cache for 5 minutes
            cache.set(cache_key, summary_data, 300)

            serializer = DashboardSummarySerializer(summary_data)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': f'Failed to generate dashboard summary: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def employees_report(self, request):
        """Generate employees report"""
        return self._generate_report('employees', request)

    @action(detail=False, methods=['get'])
    def terminations_report(self, request):
        """Generate terminations report"""
        return self._generate_report('terminations', request)

    @action(detail=False, methods=['get'])
    def evaluations_report(self, request):
        """Generate evaluations report"""
        return self._generate_report('evaluations', request)

    @action(detail=False, methods=['get'])
    def leave_requests_report(self, request):
        """Generate leave requests report"""
        return self._generate_report('leave_requests', request)

    @action(detail=False, methods=['get'])
    def admissions_report(self, request):
        """Generate admissions report"""
        return self._generate_report('admissions', request)

    def _generate_report(self, report_type: str, request):
        """Generic method to generate reports"""
        # Validate filters
        filter_serializer = ReportFilterSerializer(data=request.query_params)
        if not filter_serializer.is_valid():
            return Response(
                filter_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        filters = filter_serializer.validated_data
        output_format = filters.get('format', 'json')

        try:
            # Generate cache key
            cache_service = CacheService()
            cache_key = cache_service.generate_cache_key(report_type, filters, request.user.id)

            # Check cache
            cached_result = cache.get(cache_key)
            if cached_result and output_format == 'json':
                return Response(cached_result)

            # Generate report
            report_service = ReportService()
            data = report_service.generate_report(report_type, filters, request.user)

            # Cache JSON results
            if output_format == 'json':
                cache.set(cache_key, data, 300)  # Cache for 5 minutes
                return Response(data)

            # Handle file exports
            export_service = ExportService()

            if output_format == 'pdf':
                file_content = export_service.export_to_pdf(data, report_type)
                response = HttpResponse(file_content, content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="{report_type}_report.pdf"'
                return response

            elif output_format == 'excel':
                file_content = export_service.export_to_excel(data, report_type)
                response = HttpResponse(
                    file_content,
                    content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
                response['Content-Disposition'] = f'attachment; filename="{report_type}_report.xlsx"'
                return response

            elif output_format == 'csv':
                file_content = export_service.export_to_csv(data, report_type)
                response = HttpResponse(file_content, content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename="{report_type}_report.csv"'
                return response

        except Exception as e:
            return Response(
                {'error': f'Failed to generate {report_type} report: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def export_report(self, request):
        """Export report with custom parameters"""
        export_serializer = ReportExportSerializer(data=request.data)
        if not export_serializer.is_valid():
            return Response(
                export_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        export_data = export_serializer.validated_data
        report_type = request.data.get('report_type', 'employees')

        try:
            # Generate report data
            report_service = ReportService()
            filters = request.data.get('filters', {})
            data = report_service.generate_report(report_type, filters, request.user)

            # Export based on format
            export_service = ExportService()
            output_format = export_data['format']

            if output_format == 'pdf':
                file_content = export_service.export_to_pdf(
                    data,
                    report_type,
                    include_charts=export_data.get('include_charts', False)
                )
                content_type = 'application/pdf'
                file_extension = 'pdf'

            elif output_format == 'excel':
                file_content = export_service.export_to_excel(data, report_type)
                content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                file_extension = 'xlsx'

            elif output_format == 'csv':
                file_content = export_service.export_to_csv(data, report_type)
                content_type = 'text/csv'
                file_extension = 'csv'

            # Generate filename
            filename = export_data.get('filename', f'{report_type}_report')
            if not filename.endswith(f'.{file_extension}'):
                filename = f'{filename}.{file_extension}'

            # Send email if requested
            email_to = export_data.get('email_to')
            if email_to:
                # In a real implementation, send email with attachment
                pass

            response = HttpResponse(file_content, content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        except Exception as e:
            return Response(
                {'error': f'Failed to export report: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
