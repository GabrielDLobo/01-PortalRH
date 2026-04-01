from rest_framework import serializers
from django.utils import timezone
from datetime import date
from .models import LeaveType, LeaveRequest, LeaveBalance
from accounts.serializers import UserSerializer


class LeaveTypeSerializer(serializers.ModelSerializer):
    """
    Leave type serializer
    """
    
    class Meta:
        model = LeaveType
        fields = [
            'id', 'nome', 'descricao', 'max_dias_ano', 'requer_aprovacao',
            'antecedencia_minima', 'ativo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeaveBalanceSerializer(serializers.ModelSerializer):
    """
    Leave balance serializer
    """
    funcionario_name = serializers.CharField(
        source='funcionario.get_full_name', 
        read_only=True
    )
    tipo_name = serializers.CharField(source='tipo.nome', read_only=True)
    dias_restantes = serializers.ReadOnlyField()
    
    class Meta:
        model = LeaveBalance
        fields = [
            'id', 'funcionario', 'funcionario_name', 'tipo', 'tipo_name',
            'ano', 'dias_disponiveis', 'dias_utilizados', 'dias_restantes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'dias_restantes', 'created_at', 'updated_at']


class LeaveRequestListSerializer(serializers.ModelSerializer):
    """
    Leave request list serializer - minimal fields for list views
    """
    solicitante_name = serializers.CharField(
        source='solicitante.get_full_name', 
        read_only=True
    )
    tipo_name = serializers.CharField(source='tipo.nome', read_only=True)
    aprovador_name = serializers.CharField(
        source='aprovador.get_full_name', 
        read_only=True
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    prioridade_display = serializers.CharField(
        source='get_prioridade_display', 
        read_only=True
    )
    dias_solicitados = serializers.ReadOnlyField()
    
    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'solicitante', 'solicitante_name', 'tipo', 'tipo_name',
            'data_inicio', 'data_fim', 'dias_solicitados', 'status',
            'status_display', 'prioridade', 'prioridade_display',
            'aprovador', 'aprovador_name', 'data_aprovacao', 'created_at',
            'dias_gozo', 'tem_abono_pecuniario', 'dias_abono_pecuniario'
        ]


class LeaveRequestDetailSerializer(serializers.ModelSerializer):
    """
    Leave request detail serializer - complete information
    """
    solicitante_info = UserSerializer(source='solicitante', read_only=True)
    tipo_info = LeaveTypeSerializer(source='tipo', read_only=True)
    aprovador_info = UserSerializer(source='aprovador', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    prioridade_display = serializers.CharField(
        source='get_prioridade_display', 
        read_only=True
    )
    dias_solicitados = serializers.ReadOnlyField()
    is_pending = serializers.ReadOnlyField()
    is_approved = serializers.ReadOnlyField()
    is_rejected = serializers.ReadOnlyField()
    
    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'solicitante', 'solicitante_info', 'tipo', 'tipo_info',
            'data_inicio', 'data_fim', 'dias_solicitados', 'motivo',
            'observacoes', 'prioridade', 'prioridade_display', 'status',
            'status_display', 'aprovador', 'aprovador_info', 'data_aprovacao',
            'comentario_aprovacao', 'anexo', 'is_pending', 'is_approved',
            'is_rejected', 'created_at', 'updated_at', 'dias_gozo',
            'tem_abono_pecuniario', 'dias_abono_pecuniario'
        ]
        read_only_fields = [
            'id', 'solicitante_info', 'tipo_info', 'aprovador_info',
            'status_display', 'prioridade_display', 'dias_solicitados',
            'is_pending', 'is_approved', 'is_rejected', 'aprovador',
            'data_aprovacao', 'comentario_aprovacao', 'created_at', 'updated_at'
        ]


class LeaveRequestCreateSerializer(serializers.ModelSerializer):
    """
    Leave request creation serializer
    """

    class Meta:
        model = LeaveRequest
        fields = [
            'tipo', 'data_inicio', 'data_fim', 'motivo',
            'observacoes', 'prioridade', 'anexo', 'dias_gozo',
            'tem_abono_pecuniario', 'dias_abono_pecuniario'
        ]
    
    def validate(self, attrs):
        """Validate leave request"""
        data_inicio = attrs.get('data_inicio')
        data_fim = attrs.get('data_fim')
        tipo = attrs.get('tipo')
        dias_gozo = attrs.get('dias_gozo')
        tem_abono_pecuniario = attrs.get('tem_abono_pecuniario', False)
        dias_abono_pecuniario = attrs.get('dias_abono_pecuniario')
        user = self.context['request'].user

        # Check if user has completed admission process (for funcionario role)
        if user.is_funcionario:
            try:
                from employees.models import Employee
                employee = Employee.objects.get(user=user)
                if employee.status not in ['approved', 'active']:
                    raise serializers.ValidationError(
                        'Funcionário deve ter o processo de admissão concluído para solicitar licenças.'
                    )
            except Employee.DoesNotExist:
                raise serializers.ValidationError(
                    'Dados do funcionário não encontrados. Entre em contato com o RH.'
                )

        # Validate vacation-specific fields
        if tipo and ('rias' in tipo.nome.lower() or 'annual' in tipo.nome.lower()):
            if not dias_gozo:
                raise serializers.ValidationError({
                    'dias_gozo': 'Dias em gozo é obrigatório para solicitações de férias.'
                })

            if dias_gozo <= 0:
                raise serializers.ValidationError({
                    'dias_gozo': 'Dias em gozo deve ser maior que zero.'
                })

            # Validate abono pecuniário
            if tem_abono_pecuniario:
                if not dias_abono_pecuniario or dias_abono_pecuniario <= 0:
                    raise serializers.ValidationError({
                        'dias_abono_pecuniario': 'Número de dias de abono pecuniário deve ser informado quando há venda.'
                    })

                if dias_abono_pecuniario > 10:
                    raise serializers.ValidationError({
                        'dias_abono_pecuniario': 'Máximo de 10 dias podem ser vendidos como abono pecuniário.'
                    })

                # Check if total days don't exceed available vacation days
                total_dias = dias_gozo + dias_abono_pecuniario
                if total_dias > 30:
                    raise serializers.ValidationError({
                        'dias_abono_pecuniario': f'Total de dias (gozo + abono) não pode exceder 30 dias. Total atual: {total_dias} dias.'
                    })

            # Auto-calculate data_fim for vacation requests
            if data_inicio and dias_gozo:
                from .models import LeaveRequest
                temp_request = LeaveRequest(
                    tipo=tipo,
                    data_inicio=data_inicio,
                    dias_gozo=dias_gozo
                )
                calculated_end = temp_request.calcular_data_fim_automatica()
                if calculated_end:
                    attrs['data_fim'] = calculated_end

        # Validate dates (after potential auto-calculation)
        data_fim = attrs.get('data_fim')  # Get updated data_fim
        if data_inicio and data_fim:
            if data_fim < data_inicio:
                raise serializers.ValidationError({
                    'data_fim': 'Data de fim deve ser posterior à data de início.'
                })

            # Check if start date is in the past
            if data_inicio < date.today():
                raise serializers.ValidationError({
                    'data_inicio': 'Data de início não pode ser no passado.'
                })

        # Check minimum advance notice
        if tipo and data_inicio:
            dias_antecedencia = (data_inicio - date.today()).days
            if dias_antecedencia < tipo.antecedencia_minima:
                raise serializers.ValidationError({
                    'data_inicio': f'Solicitação deve ser feita com {tipo.antecedencia_minima} dias de antecedência.'
                })

        return attrs
    
    def create(self, validated_data):
        """Create leave request with current user as requester"""
        validated_data['solicitante'] = self.context['request'].user
        return super().create(validated_data)


class LeaveRequestUpdateSerializer(serializers.ModelSerializer):
    """
    Leave request update serializer - only for pending requests
    """
    
    class Meta:
        model = LeaveRequest
        fields = [
            'data_inicio', 'data_fim', 'motivo', 'observacoes',
            'prioridade', 'anexo'
        ]
    
    def validate(self, attrs):
        """Validate leave request update"""
        instance = self.instance
        
        # Only allow updates for pending requests
        if instance and not instance.is_pending:
            raise serializers.ValidationError(
                'Apenas solicitações pendentes podem ser editadas.'
            )
        
        # Same validation as creation
        data_inicio = attrs.get('data_inicio', instance.data_inicio if instance else None)
        data_fim = attrs.get('data_fim', instance.data_fim if instance else None)
        tipo = instance.tipo if instance else None
        
        if data_inicio and data_fim:
            if data_fim < data_inicio:
                raise serializers.ValidationError({
                    'data_fim': 'Data de fim deve ser posterior à data de início.'
                })
            
            if data_inicio < date.today():
                raise serializers.ValidationError({
                    'data_inicio': 'Data de início não pode ser no passado.'
                })
        
        if tipo and data_inicio:
            dias_antecedencia = (data_inicio - date.today()).days
            if dias_antecedencia < tipo.antecedencia_minima:
                raise serializers.ValidationError({
                    'data_inicio': f'Solicitação deve ser feita com {tipo.antecedencia_minima} dias de antecedência.'
                })
        
        return attrs


class LeaveRequestApprovalSerializer(serializers.Serializer):
    """
    Serializer for approving/rejecting leave requests
    """
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    comentario = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    
    def validate(self, attrs):
        """Validate approval action"""
        request = self.context.get('request')
        leave_request = self.context.get('leave_request')
        
        if not leave_request.is_pending:
            raise serializers.ValidationError(
                'Apenas solicitações pendentes podem ser processadas.'
            )
        
        # Check if user has permission to approve
        user = request.user
        if not user.is_admin_rh:
            raise serializers.ValidationError(
                'Usuário não tem permissão para processar solicitações.'
            )
        
        return attrs


class LeaveRequestStatsSerializer(serializers.Serializer):
    """
    Leave request statistics serializer
    """
    total_requests = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    approved_requests = serializers.IntegerField()
    rejected_requests = serializers.IntegerField()
    cancelled_requests = serializers.IntegerField()
    requests_by_type = serializers.DictField()
    requests_by_month = serializers.DictField()


class LeaveBalanceStatsSerializer(serializers.Serializer):
    """
    Leave balance statistics serializer
    """
    funcionario = serializers.CharField()
    balances = LeaveBalanceSerializer(many=True)
    total_available = serializers.IntegerField()
    total_used = serializers.IntegerField()
    total_remaining = serializers.IntegerField()


class LeaveRequestCalendarSerializer(serializers.ModelSerializer):
    """
    Leave request serializer for calendar views
    """
    title = serializers.SerializerMethodField()
    start = serializers.DateField(source='data_inicio')
    end = serializers.DateField(source='data_fim')
    color = serializers.SerializerMethodField()
    
    class Meta:
        model = LeaveRequest
        fields = ['id', 'title', 'start', 'end', 'color', 'status']
    
    def get_title(self, obj):
        """Get event title for calendar"""
        return f"{obj.solicitante.get_full_name()} - {obj.tipo.nome}"
    
    def get_color(self, obj):
        """Get color based on status"""
        colors = {
            'pendente': '#ffa500',  # orange
            'aprovada': '#28a745',  # green
            'rejeitada': '#dc3545',  # red
            'cancelada': '#6c757d'  # gray
        }
        return colors.get(obj.status, '#007bff')