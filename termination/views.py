from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Q
from datetime import date, timedelta, datetime
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import TerminationReason, TerminationRequest, TerminationDocument
from .serializers import (
    TerminationReasonSerializer, TerminationRequestListSerializer,
    TerminationRequestDetailSerializer, TerminationRequestCreateSerializer,
    TerminationRequestUpdateSerializer,
    TerminationDocumentSerializer, TerminationApprovalSerializer,
    TerminationStatsSerializer
)
from app.permissions import (
    IsAdminRH, IsStaffOrAdminRH
)

User = get_user_model()


class TerminationReasonViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing termination reasons
    """
    queryset = TerminationReason.objects.filter(ativo=True)
    serializer_class = TerminationReasonSerializer
    permission_classes = [IsStaffOrAdminRH]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nome', 'codigo', 'descricao']
    ordering_fields = ['nome', 'codigo', 'created_at']
    ordering = ['nome']

    def get_permissions(self):
        """Return appropriate permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminRH]
        else:
            permission_classes = [IsStaffOrAdminRH]

        return [permission() for permission in permission_classes]


class TerminationRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing termination requests
    """
    queryset = TerminationRequest.objects.select_related(
        'funcionario', 'solicitante', 'motivo', 'aprovador_rh'
    ).prefetch_related(
        'documents'
    ).order_by('-created_at')

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = [
        'funcionario__first_name', 'funcionario__last_name',
        'funcionario__email', 'motivo__nome', 'justificativa'
    ]
    filterset_fields = ['status', 'motivo', 'solicitante']
    ordering_fields = [
        'created_at', 'data_ultimo_dia', 'data_desligamento',
        'funcionario__first_name', 'status'
    ]
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return TerminationRequestListSerializer
        elif self.action in ['create']:
            return TerminationRequestCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TerminationRequestUpdateSerializer
        else:
            return TerminationRequestDetailSerializer

    def get_permissions(self):
        """Return appropriate permissions based on action"""
        if self.action in ['create']:
            permission_classes = [IsAdminRH]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminRH]  # Only HR can edit
        elif self.action in ['approve', 'reject', 'start_processing', 'complete']:
            permission_classes = [IsAdminRH]
        else:
            permission_classes = [IsStaffOrAdminRH]

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter queryset based on user permissions and role"""
        user = self.request.user
        queryset = super().get_queryset()

        # HR can see all requests
        if hasattr(user, 'is_admin_rh') and user.is_admin_rh:
            return queryset


        # Staff can only see their own requests
        return queryset.filter(solicitante=user)

    def perform_create(self, serializer):
        """Set the requesting user as solicitante"""
        serializer.save(solicitante=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRH])
    def approve(self, request, pk=None):
        """Approve termination request"""
        termination_request = self.get_object()

        if not termination_request.is_pending_hr:
            return Response(
                {'error': 'Solicitação não está pendente de aprovação.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TerminationApprovalSerializer(data=request.data)
        if serializer.is_valid():
            comentario = serializer.validated_data.get('comentario', '')
            termination_request.approve_by_hr(request.user, comentario)


            return Response({
                'message': 'Solicitação aprovada com sucesso.',
                'status': termination_request.status
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRH])
    def reject(self, request, pk=None):
        """Reject termination request"""
        termination_request = self.get_object()

        if not termination_request.is_pending_hr:
            return Response(
                {'error': 'Solicitação não está pendente de aprovação.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TerminationApprovalSerializer(data=request.data)
        if serializer.is_valid():
            if serializer.validated_data['action'] != 'reject':
                return Response(
                    {'error': 'Ação deve ser "reject" para rejeitar.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            comentario = serializer.validated_data.get('comentario', '')
            termination_request.reject_by_hr(request.user, comentario)

            return Response({
                'message': 'Solicitação rejeitada.',
                'status': termination_request.status
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRH])
    def submit_for_approval(self, request, pk=None):
        """Submit termination request for HR approval"""
        termination_request = self.get_object()

        if not termination_request.is_draft:
            return Response(
                {'error': 'Apenas rascunhos podem ser enviados para aprovação.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        termination_request.submit_for_approval()

        return Response({
            'message': 'Solicitação enviada para aprovação do RH.',
            'status': termination_request.status
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRH])
    def start_processing(self, request, pk=None):
        """Start processing the termination (calculations, documents)"""
        termination_request = self.get_object()

        if not termination_request.is_approved:
            return Response(
                {'error': 'Solicitação deve estar aprovada para iniciar processamento.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        termination_request.start_processing()

        return Response({
            'message': 'Processamento da rescisão iniciado.',
            'status': termination_request.status
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRH])
    def complete(self, request, pk=None):
        """Complete the termination process"""
        termination_request = self.get_object()

        if termination_request.status != TerminationRequest.StatusChoices.PROCESSANDO:
            return Response(
                {'error': 'Solicitação deve estar em processamento para ser concluída.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        termination_request.complete_termination()

        return Response({
            'message': 'Processo de desligamento concluído.',
            'status': termination_request.status
        })

    @action(detail=True, methods=['delete'], permission_classes=[IsAdminRH])
    def cancel(self, request, pk=None):
        """Cancel termination request"""
        termination_request = self.get_object()

        # Check permissions - only creator or HR can cancel
        if (request.user != termination_request.solicitante and
            not (hasattr(request.user, 'is_admin_rh') and request.user.is_admin_rh)):
            return Response(
                {'error': 'Apenas o solicitante ou RH pode cancelar esta solicitação.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not termination_request.can_be_edited:
            return Response(
                {'error': 'Esta solicitação não pode mais ser cancelada.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        termination_request.cancel()

        return Response({
            'message': 'Solicitação cancelada.',
            'status': termination_request.status
        })

    @action(detail=False, methods=['get'], permission_classes=[IsStaffOrAdminRH])
    def stats(self, request):
        """Get termination statistics"""
        # Filter queryset based on user permissions
        queryset = self.get_queryset()

        # Status distribution
        stats = {
            'total': queryset.count(),
            'rascunho': queryset.filter(status=TerminationRequest.StatusChoices.RASCUNHO).count(),
            'pendente_rh': queryset.filter(status=TerminationRequest.StatusChoices.PENDENTE_RH).count(),
            'aprovada_rh': queryset.filter(status=TerminationRequest.StatusChoices.APROVADA_RH).count(),
            'rejeitada_rh': queryset.filter(status=TerminationRequest.StatusChoices.REJEITADA_RH).count(),
            'processando': queryset.filter(status=TerminationRequest.StatusChoices.PROCESSANDO).count(),
            'concluida': queryset.filter(status=TerminationRequest.StatusChoices.CONCLUIDA).count(),
            'cancelada': queryset.filter(status=TerminationRequest.StatusChoices.CANCELADA).count(),
        }


        # Monthly statistics (last 12 months)
        today = timezone.now().date()
        por_mes = []
        for i in range(12):
            month_start = date(today.year, today.month, 1) - timedelta(days=i*30)
            month_end = month_start + timedelta(days=30)
            count = queryset.filter(
                created_at__date__gte=month_start,
                created_at__date__lt=month_end
            ).count()
            por_mes.append({
                'mes': month_start.strftime('%Y-%m'),
                'count': count
            })

        stats['por_mes'] = list(reversed(por_mes))

        serializer = TerminationStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminRH])
    def my_requests(self, request):
        """Get current user's termination requests"""
        queryset = self.get_queryset().filter(solicitante=request.user)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TerminationDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing termination documents
    """
    serializer_class = TerminationDocumentSerializer
    permission_classes = [IsAdminRH]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nome_arquivo', 'observacoes']
    filterset_fields = ['termination_request', 'tipo_documento', 'gerado_automaticamente']
    ordering_fields = ['created_at', 'nome_arquivo', 'tipo_documento']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return termination documents"""
        return TerminationDocument.objects.select_related(
            'termination_request', 'gerado_por'
        ).all()

    def perform_create(self, serializer):
        """Set the uploading user"""
        serializer.save(gerado_por=self.request.user)