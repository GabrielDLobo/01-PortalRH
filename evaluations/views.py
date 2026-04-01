from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Avg, Q
from datetime import date, timedelta

from .models import (
    EvaluationTemplate, EvaluationCriteria, Evaluation,
    EvaluationScore, EvaluationCycle, EvaluationCycleParticipant
)
from .serializers import (
    EvaluationTemplateSerializer, EvaluationTemplateListSerializer,
    EvaluationListSerializer, EvaluationDetailSerializer, EvaluationCreateSerializer,
    EvaluationUpdateSerializer, EvaluationScoreSerializer, EvaluationScoreCreateSerializer,
    EvaluationCycleSerializer, EvaluationCycleListSerializer,
    EvaluationStatsSerializer, EvaluationActionSerializer
)
from app.permissions import (
    IsAdminRH, CanViewEvaluation, CanManageEvaluation, IsStaffOrAdminRH
)


class EvaluationTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing evaluation templates
    """
    queryset = EvaluationTemplate.objects.prefetch_related('criteria')
    permission_classes = [IsStaffOrAdminRH]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'created_at']
    ordering = ['nome']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return EvaluationTemplateListSerializer
        return EvaluationTemplateSerializer
    
    def get_permissions(self):
        """Return appropriate permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminRH]
        else:
            permission_classes = [IsStaffOrAdminRH]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset to show only active templates for non-admin users"""
        if self.request.user.is_admin_rh:
            return self.queryset
        return self.queryset.filter(ativo=True)


class EvaluationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing evaluations
    """
    queryset = Evaluation.objects.select_related(
        'template', 'avaliado', 'avaliador'
    ).prefetch_related('scores__criterio')
    permission_classes = [IsStaffOrAdminRH]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'tipo', 'template', 'avaliado', 'avaliador']
    search_fields = [
        'avaliado__first_name', 'avaliado__last_name', 'avaliado__email',
        'avaliador__first_name', 'avaliador__last_name', 'avaliador__email'
    ]
    ordering_fields = ['created_at', 'periodo_inicio', 'periodo_fim', 'nota_final']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return EvaluationListSerializer
        elif self.action == 'retrieve':
            return EvaluationDetailSerializer
        elif self.action == 'create':
            return EvaluationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return EvaluationUpdateSerializer
        elif self.action == 'evaluate':
            return EvaluationActionSerializer
        return EvaluationDetailSerializer
    
    def get_permissions(self):
        """Return appropriate permissions based on action"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [CanViewEvaluation]
        elif self.action in ['create', 'update', 'partial_update']:
            permission_classes = [CanManageEvaluation]
        elif self.action in ['evaluate', 'stats']:
            permission_classes = [IsAdminRH]
        elif self.action in ['my_evaluations']:
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
            # Regular employees can only see evaluations where they are involved
            return self.queryset.filter(
                models.Q(avaliado=user) | models.Q(avaliador=user)
            )
    
    @action(detail=False, methods=['get'])
    def my_evaluations(self, request):
        """Get evaluations where current user is involved"""
        user = request.user
        
        # Evaluations where user is being evaluated
        received = self.queryset.filter(avaliado=user)
        
        # Evaluations where user is the evaluator
        given = self.queryset.filter(avaliador=user)
        
        return Response({
            'received': EvaluationListSerializer(received, many=True).data,
            'given': EvaluationListSerializer(given, many=True).data
        })
    
    @action(detail=True, methods=['post'])
    def evaluate(self, request, pk=None):
        """Perform evaluation actions (finalize, approve, reject)"""
        evaluation = self.get_object()
        serializer = self.get_serializer(
            data=request.data,
            context={'evaluation': evaluation}
        )
        
        if serializer.is_valid():
            action = serializer.validated_data['action']
            comentario = serializer.validated_data.get('comentario', '')
            
            if action == 'finalize':
                evaluation.finalize_evaluation()
                message = 'Avaliação finalizada com sucesso.'
            elif action == 'approve':
                evaluation.approve()
                message = 'Avaliação aprovada com sucesso.'
            else:  # reject
                evaluation.reject()
                message = 'Avaliação rejeitada.'
            
            return Response({
                'message': message,
                'status': evaluation.status,
                'nota_final': evaluation.nota_final
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get evaluation statistics"""
        evaluations = Evaluation.objects.all()
        
        # Basic counts
        stats_data = {
            'total_evaluations': evaluations.count(),
            'pending_evaluations': evaluations.filter(status='pendente').count(),
            'completed_evaluations': evaluations.filter(status='concluida').count(),
            'approved_evaluations': evaluations.filter(status='aprovada').count(),
        }
        
        # Average score
        avg_score = evaluations.filter(
            nota_final__isnull=False
        ).aggregate(Avg('nota_final'))['nota_final__avg']
        
        stats_data['average_score'] = avg_score or 0
        
        # Evaluations by type
        evaluations_by_type = dict(
            evaluations.values('tipo').annotate(
                count=Count('id')
            ).values_list('tipo', 'count')
        )
        stats_data['evaluations_by_type'] = evaluations_by_type
        
        # Evaluations by month (current year)
        current_year = date.today().year
        evaluations_by_month = {}
        
        for month in range(1, 13):
            count = evaluations.filter(
                created_at__year=current_year,
                created_at__month=month
            ).count()
            month_name = date(current_year, month, 1).strftime('%B')
            evaluations_by_month[month_name] = count
        
        stats_data['evaluations_by_month'] = evaluations_by_month
        
        # Top performers (highest average scores)
        top_performers = evaluations.filter(
            nota_final__isnull=False
        ).values(
            'avaliado__first_name', 'avaliado__last_name'
        ).annotate(
            avg_score=Avg('nota_final')
        ).order_by('-avg_score')[:5]
        
        stats_data['top_performers'] = list(top_performers)
        
        # Improvement needed (lowest scores)
        improvement_needed = evaluations.filter(
            nota_final__lt=5.0
        ).values(
            'avaliado__first_name', 'avaliado__last_name'
        ).annotate(
            avg_score=Avg('nota_final')
        ).order_by('avg_score')[:5]
        
        stats_data['improvement_needed'] = list(improvement_needed)
        
        serializer = EvaluationStatsSerializer(stats_data)
        return Response(serializer.data)


class EvaluationScoreViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing evaluation scores
    """
    queryset = EvaluationScore.objects.select_related('avaliacao', 'criterio')
    serializer_class = EvaluationScoreSerializer
    permission_classes = [IsStaffOrAdminRH, CanManageEvaluation]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['avaliacao', 'criterio']
    ordering_fields = ['criterio__ordem', 'nota']
    ordering = ['criterio__ordem']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return EvaluationScoreCreateSerializer
        return EvaluationScoreSerializer
    
    def get_queryset(self):
        """Filter queryset based on user role and evaluation access"""
        user = self.request.user
        
        if user.is_admin_rh:
            return self.queryset
        else:
            # Only scores for evaluations the user can manage
            from django.db import models
            return self.queryset.filter(
                models.Q(avaliacao__avaliador=user) |
                models.Q(avaliacao__avaliado=user)
            )
    
    def get_serializer_context(self):
        """Add evaluation to context if provided in URL"""
        context = super().get_serializer_context()
        
        # If evaluation_pk is in the URL, add it to context
        evaluation_pk = self.kwargs.get('evaluation_pk')
        if evaluation_pk:
            try:
                from .models import Evaluation
                evaluation = Evaluation.objects.get(pk=evaluation_pk)
                context['evaluation'] = evaluation
            except Evaluation.DoesNotExist:
                pass
        
        return context


class EvaluationCycleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing evaluation cycles
    """
    queryset = EvaluationCycle.objects.select_related(
        'template', 'created_by'
    ).prefetch_related('participants')
    
    permission_classes = [IsAdminRH]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'template']
    search_fields = ['nome', 'descricao']
    ordering_fields = ['created_at', 'data_inicio', 'data_fim']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return EvaluationCycleListSerializer
        return EvaluationCycleSerializer
    
    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start an evaluation cycle"""
        cycle = self.get_object()
        
        if cycle.status != 'planejado':
            return Response(
                {'detail': 'Apenas ciclos planejados podem ser iniciados.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cycle.start_cycle()
        
        return Response({
            'message': 'Ciclo de avaliação iniciado com sucesso.',
            'status': cycle.status
        })
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete an evaluation cycle"""
        cycle = self.get_object()
        
        if cycle.status != 'ativo':
            return Response(
                {'detail': 'Apenas ciclos ativos podem ser finalizados.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cycle.complete_cycle()
        
        return Response({
            'message': 'Ciclo de avaliação finalizado com sucesso.',
            'status': cycle.status
        })
