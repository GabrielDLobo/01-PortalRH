from rest_framework import serializers
from decimal import Decimal
from .models import (
    EvaluationTemplate, EvaluationCriteria, Evaluation, 
    EvaluationScore, EvaluationCycle, EvaluationCycleParticipant
)
from accounts.serializers import UserSerializer


class EvaluationCriteriaSerializer(serializers.ModelSerializer):
    """
    Evaluation criteria serializer
    """
    
    class Meta:
        model = EvaluationCriteria
        fields = [
            'id', 'template', 'nome', 'descricao', 'peso', 'ordem', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class EvaluationTemplateSerializer(serializers.ModelSerializer):
    """
    Evaluation template serializer
    """
    criteria = EvaluationCriteriaSerializer(many=True, read_only=True)
    criteria_count = serializers.SerializerMethodField()
    
    class Meta:
        model = EvaluationTemplate
        fields = [
            'id', 'nome', 'descricao', 'ativo', 'criteria',
            'criteria_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'criteria_count', 'created_at', 'updated_at']
    
    def get_criteria_count(self, obj):
        """Get number of criteria"""
        return obj.criteria.count()


class EvaluationTemplateListSerializer(serializers.ModelSerializer):
    """
    Evaluation template list serializer - minimal fields
    """
    criteria_count = serializers.SerializerMethodField()
    
    class Meta:
        model = EvaluationTemplate
        fields = ['id', 'nome', 'descricao', 'ativo', 'criteria_count', 'created_at']
    
    def get_criteria_count(self, obj):
        """Get number of criteria"""
        return obj.criteria.count()


class EvaluationScoreSerializer(serializers.ModelSerializer):
    """
    Evaluation score serializer
    """
    criterio_info = EvaluationCriteriaSerializer(source='criterio', read_only=True)
    weighted_score = serializers.ReadOnlyField()
    
    class Meta:
        model = EvaluationScore
        fields = [
            'id', 'avaliacao', 'criterio', 'criterio_info', 'nota',
            'comentario', 'weighted_score', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'weighted_score', 'created_at', 'updated_at']


class EvaluationListSerializer(serializers.ModelSerializer):
    """
    Evaluation list serializer - minimal fields for list views
    """
    avaliado_name = serializers.CharField(source='avaliado.get_full_name', read_only=True)
    avaliador_name = serializers.CharField(source='avaliador.get_full_name', read_only=True)
    template_name = serializers.CharField(source='template.nome', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    is_completed = serializers.ReadOnlyField()
    is_pending = serializers.ReadOnlyField()
    
    class Meta:
        model = Evaluation
        fields = [
            'id', 'template', 'template_name', 'avaliado', 'avaliado_name',
            'avaliador', 'avaliador_name', 'tipo', 'tipo_display',
            'periodo_inicio', 'periodo_fim', 'status', 'status_display',
            'nota_final', 'is_completed', 'is_pending', 'data_limite',
            'data_conclusao', 'created_at'
        ]


class EvaluationDetailSerializer(serializers.ModelSerializer):
    """
    Evaluation detail serializer - complete information
    """
    template_info = EvaluationTemplateSerializer(source='template', read_only=True)
    avaliado_info = UserSerializer(source='avaliado', read_only=True)
    avaliador_info = UserSerializer(source='avaliador', read_only=True)
    scores = EvaluationScoreSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    is_completed = serializers.ReadOnlyField()
    is_pending = serializers.ReadOnlyField()
    
    class Meta:
        model = Evaluation
        fields = [
            'id', 'template', 'template_info', 'avaliado', 'avaliado_info',
            'avaliador', 'avaliador_info', 'tipo', 'tipo_display',
            'periodo_inicio', 'periodo_fim', 'status', 'status_display',
            'nota_final', 'comentario_geral', 'pontos_fortes',
            'pontos_melhoria', 'metas_objetivos', 'data_limite',
            'data_conclusao', 'scores', 'is_completed', 'is_pending',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'template_info', 'avaliado_info', 'avaliador_info',
            'scores', 'status_display', 'tipo_display', 'is_completed',
            'is_pending', 'nota_final', 'data_conclusao', 'created_at', 'updated_at'
        ]


class EvaluationCreateSerializer(serializers.ModelSerializer):
    """
    Evaluation creation serializer
    """
    
    class Meta:
        model = Evaluation
        fields = [
            'template', 'avaliado', 'tipo', 'periodo_inicio',
            'periodo_fim', 'data_limite'
        ]
    
    def validate(self, attrs):
        """Validate evaluation creation"""
        periodo_inicio = attrs.get('periodo_inicio')
        periodo_fim = attrs.get('periodo_fim')
        
        if periodo_inicio and periodo_fim:
            if periodo_fim <= periodo_inicio:
                raise serializers.ValidationError({
                    'periodo_fim': 'Data de fim deve ser posterior à data de início.'
                })
        
        return attrs
    
    def create(self, validated_data):
        """Create evaluation with current user as evaluator"""
        validated_data['avaliador'] = self.context['request'].user
        return super().create(validated_data)


class EvaluationUpdateSerializer(serializers.ModelSerializer):
    """
    Evaluation update serializer
    """
    
    class Meta:
        model = Evaluation
        fields = [
            'comentario_geral', 'pontos_fortes', 'pontos_melhoria',
            'metas_objetivos', 'data_limite'
        ]
    
    def validate(self, attrs):
        """Validate evaluation update"""
        instance = self.instance
        
        # Only allow updates for evaluations that are not completed/approved
        if instance and instance.is_completed:
            raise serializers.ValidationError(
                'Avaliações finalizadas não podem ser editadas.'
            )
        
        return attrs


class EvaluationScoreCreateSerializer(serializers.ModelSerializer):
    """
    Evaluation score creation serializer
    """
    
    class Meta:
        model = EvaluationScore
        fields = ['criterio', 'nota', 'comentario']
    
    def validate_nota(self, value):
        """Validate score value"""
        if not (Decimal('0.00') <= value <= Decimal('10.00')):
            raise serializers.ValidationError('Nota deve estar entre 0.00 e 10.00.')
        return value
    
    def create(self, validated_data):
        """Create score with evaluation from context"""
        validated_data['avaliacao'] = self.context['evaluation']
        return super().create(validated_data)


class EvaluationCycleParticipantSerializer(serializers.ModelSerializer):
    """
    Evaluation cycle participant serializer
    """
    funcionario_info = UserSerializer(source='funcionario', read_only=True)
    avaliador_info = UserSerializer(source='avaliador', read_only=True)
    
    class Meta:
        model = EvaluationCycleParticipant
        fields = [
            'id', 'cycle', 'funcionario', 'funcionario_info',
            'avaliador', 'avaliador_info', 'data_limite',
            'concluido', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class EvaluationCycleSerializer(serializers.ModelSerializer):
    """
    Evaluation cycle serializer
    """
    template_info = EvaluationTemplateSerializer(source='template', read_only=True)
    created_by_info = UserSerializer(source='created_by', read_only=True)
    participants = EvaluationCycleParticipantSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_active = serializers.ReadOnlyField()
    participation_count = serializers.ReadOnlyField()
    
    class Meta:
        model = EvaluationCycle
        fields = [
            'id', 'nome', 'descricao', 'data_inicio', 'data_fim',
            'template', 'template_info', 'status', 'status_display',
            'created_by', 'created_by_info', 'participants',
            'is_active', 'participation_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'template_info', 'created_by_info', 'participants',
            'status_display', 'is_active', 'participation_count',
            'created_at', 'updated_at'
        ]


class EvaluationCycleListSerializer(serializers.ModelSerializer):
    """
    Evaluation cycle list serializer - minimal fields
    """
    template_name = serializers.CharField(source='template.nome', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_active = serializers.ReadOnlyField()
    participation_count = serializers.ReadOnlyField()
    
    class Meta:
        model = EvaluationCycle
        fields = [
            'id', 'nome', 'data_inicio', 'data_fim', 'template',
            'template_name', 'status', 'status_display', 'created_by',
            'created_by_name', 'is_active', 'participation_count', 'created_at'
        ]


class EvaluationStatsSerializer(serializers.Serializer):
    """
    Evaluation statistics serializer
    """
    total_evaluations = serializers.IntegerField()
    pending_evaluations = serializers.IntegerField()
    completed_evaluations = serializers.IntegerField()
    approved_evaluations = serializers.IntegerField()
    average_score = serializers.DecimalField(max_digits=4, decimal_places=2)
    evaluations_by_type = serializers.DictField()
    evaluations_by_month = serializers.DictField()
    top_performers = serializers.ListField()
    improvement_needed = serializers.ListField()


class EvaluationReportSerializer(serializers.Serializer):
    """
    Evaluation report serializer
    """
    employee_name = serializers.CharField()
    evaluation_period = serializers.CharField()
    template_name = serializers.CharField()
    final_score = serializers.DecimalField(max_digits=4, decimal_places=2)
    status = serializers.CharField()
    criteria_scores = serializers.ListField()
    strengths = serializers.CharField()
    improvements = serializers.CharField()
    goals = serializers.CharField()
    evaluator_name = serializers.CharField()
    completion_date = serializers.DateTimeField()


class EvaluationActionSerializer(serializers.Serializer):
    """
    Serializer for evaluation actions (finalize, approve, reject)
    """
    action = serializers.ChoiceField(choices=['finalize', 'approve', 'reject'])
    comentario = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    
    def validate(self, attrs):
        """Validate action based on evaluation state"""
        evaluation = self.context.get('evaluation')
        action = attrs.get('action')
        
        if action == 'finalize':
            if evaluation.is_completed:
                raise serializers.ValidationError('Avaliação já foi finalizada.')
            
            # Check if all criteria have scores
            criteria_count = evaluation.template.criteria.count()
            scores_count = evaluation.scores.count()
            
            if criteria_count != scores_count:
                raise serializers.ValidationError(
                    'Todas as pontuações devem ser preenchidas antes de finalizar.'
                )
        
        elif action in ['approve', 'reject']:
            if not evaluation.is_completed:
                raise serializers.ValidationError(
                    'Apenas avaliações finalizadas podem ser aprovadas/rejeitadas.'
                )
        
        return attrs