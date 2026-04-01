from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Q
from datetime import date, timedelta

from .models import LeaveType, LeaveRequest, LeaveBalance
from .serializers import (
    LeaveTypeSerializer, LeaveRequestListSerializer, LeaveRequestDetailSerializer,
    LeaveRequestCreateSerializer, LeaveRequestUpdateSerializer, LeaveBalanceSerializer,
    LeaveRequestApprovalSerializer, LeaveRequestStatsSerializer, 
    LeaveBalanceStatsSerializer, LeaveRequestCalendarSerializer
)
from app.permissions import (
    IsAdminRH, CanViewLeaveRequest,
    CanApproveLeaveRequest, IsOwnerOrAdminRH, IsStaffOrAdminRH
)


class LeaveTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing leave types
    """
    queryset = LeaveType.objects.filter(ativo=True)
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsStaffOrAdminRH]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'max_dias_ano', 'created_at']
    ordering = ['nome']
    
    def get_permissions(self):
        """Return appropriate permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminRH]
        else:
            permission_classes = [IsStaffOrAdminRH]
        
        return [permission() for permission in permission_classes]


class LeaveRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing leave requests
    """
    queryset = LeaveRequest.objects.select_related(
        'solicitante', 'tipo', 'aprovador'
    ).order_by('-created_at')
    permission_classes = [IsStaffOrAdminRH]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'tipo', 'prioridade', 'data_inicio']
    search_fields = [
        'solicitante__first_name', 'solicitante__last_name', 
        'solicitante__email', 'motivo'
    ]
    ordering_fields = ['created_at', 'data_inicio', 'data_fim', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return LeaveRequestListSerializer
        elif self.action == 'retrieve':
            return LeaveRequestDetailSerializer
        elif self.action == 'create':
            return LeaveRequestCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LeaveRequestUpdateSerializer
        elif self.action == 'approve':
            return LeaveRequestApprovalSerializer
        elif self.action == 'calendar':
            return LeaveRequestCalendarSerializer
        return LeaveRequestDetailSerializer
    
    def get_permissions(self):
        """Return appropriate permissions based on action"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [CanViewLeaveRequest]
        elif self.action in ['create']:
            permission_classes = [permissions.IsAuthenticated]  # Allow all authenticated users to create
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsOwnerOrAdminRH]
        elif self.action == 'approve':
            permission_classes = [CanApproveLeaveRequest]
        elif self.action in ['stats', 'calendar']:
            permission_classes = [IsStaffOrAdminRH]
        elif self.action == 'my_requests':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        
        if user.is_admin_rh:
            return self.queryset
        else:
            # Regular employees can only see their own requests
            return self.queryset.filter(solicitante=user)
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get current user's leave requests"""
        requests = self.queryset.filter(solicitante=request.user)
        serializer = LeaveRequestListSerializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve or reject a leave request"""
        leave_request = self.get_object()
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request, 'leave_request': leave_request}
        )
        
        if serializer.is_valid():
            action = serializer.validated_data['action']
            comentario = serializer.validated_data.get('comentario', '')
            
            if action == 'approve':
                leave_request.approve(request.user, comentario)
                message = 'Solicitação aprovada com sucesso.'
            else:
                leave_request.reject(request.user, comentario)
                message = 'Solicitação rejeitada.'
            
            return Response({
                'message': message,
                'status': leave_request.status
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a leave request"""
        leave_request = self.get_object()
        
        # Only the requester can cancel their own request
        if leave_request.solicitante != request.user:
            return Response(
                {'detail': 'Você só pode cancelar suas próprias solicitações.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not leave_request.is_pending:
            return Response(
                {'detail': 'Apenas solicitações pendentes podem ser canceladas.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        leave_request.cancel()
        
        return Response({
            'message': 'Solicitação cancelada com sucesso.'
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get leave request statistics"""
        requests = LeaveRequest.objects.all()
        
        # Basic counts
        stats_data = {
            'total_requests': requests.count(),
            'pending_requests': requests.filter(status='pendente').count(),
            'approved_requests': requests.filter(status='aprovada').count(),
            'rejected_requests': requests.filter(status='rejeitada').count(),
            'cancelled_requests': requests.filter(status='cancelada').count(),
        }
        
        # Requests by type
        requests_by_type = dict(
            requests.values('tipo__nome').annotate(
                count=Count('id')
            ).values_list('tipo__nome', 'count')
        )
        stats_data['requests_by_type'] = requests_by_type
        
        # Requests by month (current year)
        current_year = date.today().year
        requests_by_month = {}
        
        for month in range(1, 13):
            count = requests.filter(
                created_at__year=current_year,
                created_at__month=month
            ).count()
            month_name = date(current_year, month, 1).strftime('%B')
            requests_by_month[month_name] = count
        
        stats_data['requests_by_month'] = requests_by_month
        
        serializer = LeaveRequestStatsSerializer(stats_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """Get leave requests for calendar view"""
        # Filter approved requests by date range if provided
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')
        
        requests = self.get_queryset().filter(status='aprovada')
        
        if start_date:
            requests = requests.filter(data_fim__gte=start_date)
        if end_date:
            requests = requests.filter(data_inicio__lte=end_date)
        
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)


class LeaveBalanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing leave balances
    """
    queryset = LeaveBalance.objects.select_related('funcionario', 'tipo')
    serializer_class = LeaveBalanceSerializer
    permission_classes = [IsStaffOrAdminRH]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['funcionario', 'tipo', 'ano']
    search_fields = [
        'funcionario__first_name', 'funcionario__last_name',
        'funcionario__email', 'tipo__nome'
    ]
    ordering_fields = ['ano', 'created_at']
    ordering = ['-ano', 'funcionario__first_name']
    
    def get_permissions(self):
        """Return appropriate permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminRH]
        else:
            permission_classes = [IsStaffOrAdminRH]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        
        if user.is_admin_rh:
            return self.queryset
        else:
            # Regular employees can only see their own balances
            return self.queryset.filter(funcionario=user)
    
    @action(detail=False, methods=['get'])
    def my_balances(self, request):
        """Get current user's leave balances"""
        current_year = date.today().year
        balances = self.queryset.filter(
            funcionario=request.user,
            ano=current_year
        )
        
        total_available = sum(b.dias_disponiveis for b in balances)
        total_used = sum(b.dias_utilizados for b in balances)
        total_remaining = sum(b.dias_restantes for b in balances)
        
        stats_data = {
            'funcionario': request.user.get_full_name(),
            'balances': balances,
            'total_available': total_available,
            'total_used': total_used,
            'total_remaining': total_remaining
        }
        
        serializer = LeaveBalanceStatsSerializer(stats_data)
        return Response(serializer.data)
