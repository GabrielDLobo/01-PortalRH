from rest_framework import serializers
from django.utils import timezone
from datetime import date
from .models import TerminationReason, TerminationRequest, TerminationDocument
from accounts.serializers import UserSerializer


class TerminationReasonSerializer(serializers.ModelSerializer):
    """
    Termination reason serializer
    """

    class Meta:
        model = TerminationReason
        fields = [
            'id', 'nome', 'codigo', 'descricao',
            'ativo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']



class TerminationDocumentSerializer(serializers.ModelSerializer):
    """
    Termination document serializer
    """
    gerado_por_name = serializers.CharField(
        source='gerado_por.get_full_name',
        read_only=True
    )
    tipo_documento_display = serializers.CharField(source='get_tipo_documento_display', read_only=True)

    class Meta:
        model = TerminationDocument
        fields = [
            'id', 'termination_request', 'tipo_documento', 'tipo_documento_display',
            'nome_arquivo', 'arquivo', 'gerado_automaticamente', 'gerado_por',
            'gerado_por_name', 'observacoes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TerminationRequestListSerializer(serializers.ModelSerializer):
    """
    Termination request list serializer - minimal fields for list views
    """
    funcionario_name = serializers.CharField(
        source='funcionario.get_full_name',
        read_only=True
    )
    funcionario_email = serializers.CharField(
        source='funcionario.email',
        read_only=True
    )
    solicitante_name = serializers.CharField(
        source='solicitante.get_full_name',
        read_only=True
    )
    motivo_nome = serializers.CharField(source='motivo.nome', read_only=True)
    motivo_codigo = serializers.CharField(source='motivo.codigo', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    aprovador_rh_name = serializers.CharField(
        source='aprovador_rh.get_full_name',
        read_only=True
    )

    # Calculated fields
    is_draft = serializers.ReadOnlyField()
    is_pending_hr = serializers.ReadOnlyField()
    is_approved = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    can_be_edited = serializers.ReadOnlyField()

    class Meta:
        model = TerminationRequest
        fields = [
            'id', 'funcionario', 'funcionario_name', 'funcionario_email',
            'solicitante', 'solicitante_name', 'motivo', 'motivo_nome', 'motivo_codigo',
            'data_ultimo_dia', 'data_desligamento', 'justificativa',
            'status', 'status_display',
            'aprovador_rh', 'aprovador_rh_name', 'data_aprovacao_rh',
            'is_draft', 'is_pending_hr', 'is_approved', 'is_completed', 'can_be_edited',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'aprovador_rh', 'data_aprovacao_rh',
            'created_at', 'updated_at'
        ]


class TerminationRequestDetailSerializer(serializers.ModelSerializer):
    """
    Termination request detail serializer - complete information
    """
    funcionario = UserSerializer(read_only=True)
    solicitante = UserSerializer(read_only=True)
    aprovador_rh = UserSerializer(read_only=True)
    motivo = TerminationReasonSerializer(read_only=True)

    # Related data
    documents = TerminationDocumentSerializer(many=True, read_only=True)

    # Display fields
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # Calculated fields
    is_draft = serializers.ReadOnlyField()
    is_pending_hr = serializers.ReadOnlyField()
    is_approved = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    can_be_edited = serializers.ReadOnlyField()

    class Meta:
        model = TerminationRequest
        fields = [
            'id', 'funcionario', 'solicitante', 'motivo', 'data_ultimo_dia',
            'data_desligamento', 'justificativa', 'observacoes_rh',
            'status', 'status_display',
            'aprovador_rh', 'data_aprovacao_rh', 'comentario_aprovacao_rh',
            'anexo_documentos',
            'is_draft', 'is_pending_hr', 'is_approved', 'is_completed', 'can_be_edited',
            'documents', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'aprovador_rh', 'data_aprovacao_rh', 'comentario_aprovacao_rh',
            'observacoes_rh', 'created_at', 'updated_at'
        ]


class TerminationRequestCreateSerializer(serializers.ModelSerializer):
    """
    Termination request create serializer
    """

    class Meta:
        model = TerminationRequest
        fields = [
            'funcionario', 'motivo', 'data_ultimo_dia', 'data_desligamento',
            'justificativa', 'anexo_documentos'
        ]

    def validate(self, data):
        """
        Validate termination request data
        """
        # Check if termination date is after last work day
        if data.get('data_desligamento') and data.get('data_ultimo_dia'):
            if data['data_desligamento'] < data['data_ultimo_dia']:
                raise serializers.ValidationError({
                    'data_desligamento': 'Data de desligamento deve ser igual ou posterior ao último dia de trabalho.'
                })

        # Check if last work day is not in the past
        if data.get('data_ultimo_dia') and data['data_ultimo_dia'] <= date.today():
            raise serializers.ValidationError({
                'data_ultimo_dia': 'Último dia de trabalho deve ser no futuro.'
            })


        return data

    def create(self, validated_data):
        """
        Create termination request and set the requesting user as solicitante
        """
        # Set the requesting user as solicitante
        validated_data['solicitante'] = self.context['request'].user
        return super().create(validated_data)


class TerminationRequestUpdateSerializer(serializers.ModelSerializer):
    """
    Termination request update serializer - only allows editing if in draft or rejected
    """

    class Meta:
        model = TerminationRequest
        fields = [
            'funcionario', 'motivo', 'data_ultimo_dia', 'data_desligamento',
            'justificativa', 'anexo_documentos'
        ]

    def validate(self, data):
        """
        Validate that request can be edited
        """
        if not self.instance.can_be_edited:
            raise serializers.ValidationError(
                'Esta solicitação não pode mais ser editada.'
            )

        # Apply same validations as create
        return TerminationRequestCreateSerializer.validate(self, data)


class TerminationApprovalSerializer(serializers.Serializer):
    """
    Serializer for termination approval/rejection actions
    """
    action = serializers.ChoiceField(choices=['approve', 'reject'], required=True)
    comentario = serializers.CharField(max_length=1000, required=False, allow_blank=True)

    def validate(self, data):
        """
        Validate approval/rejection data
        """
        if data['action'] == 'reject' and not data.get('comentario'):
            raise serializers.ValidationError({
                'comentario': 'Comentário é obrigatório para rejeições.'
            })
        return data


class TerminationStatsSerializer(serializers.Serializer):
    """
    Serializer for termination statistics
    """
    total = serializers.IntegerField(read_only=True)
    rascunho = serializers.IntegerField(read_only=True)
    pendente_rh = serializers.IntegerField(read_only=True)
    aprovada_rh = serializers.IntegerField(read_only=True)
    rejeitada_rh = serializers.IntegerField(read_only=True)
    processando = serializers.IntegerField(read_only=True)
    concluida = serializers.IntegerField(read_only=True)
    cancelada = serializers.IntegerField(read_only=True)


    # By month (last 12 months)
    por_mes = serializers.ListField(read_only=True)