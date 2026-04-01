from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from datetime import date, timedelta
from typing import Optional


class LeaveType(models.Model):
    """
    Model for different types of leave requests
    """
    
    nome = models.CharField(max_length=100, unique=True, verbose_name='Nome')
    descricao = models.TextField(blank=True, verbose_name='Descrição')
    max_dias_ano = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text='Máximo de dias por ano',
        verbose_name='Máximo de dias por ano'
    )
    requer_aprovacao = models.BooleanField(
        default=True, 
        verbose_name='Requer aprovação'
    )
    antecedencia_minima = models.PositiveIntegerField(
        default=1,
        help_text='Antecedência mínima em dias',
        verbose_name='Antecedência mínima (dias)'
    )
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'leave_requests_leave_type'
        verbose_name = 'Tipo de Solicitação'
        verbose_name_plural = 'Tipos de Solicitações'
        ordering = ['nome']
    
    def __str__(self) -> str:
        return self.nome


class LeaveRequest(models.Model):
    """
    Model for leave requests with approval workflow
    """
    
    class StatusChoices(models.TextChoices):
        PENDENTE = 'pendente', 'Pendente'
        APROVADA = 'aprovada', 'Aprovada'
        REJEITADA = 'rejeitada', 'Rejeitada'
        CANCELADA = 'cancelada', 'Cancelada'
    
    class PriorityChoices(models.TextChoices):
        BAIXA = 'baixa', 'Baixa'
        MEDIA = 'media', 'Média'
        ALTA = 'alta', 'Alta'
        URGENTE = 'urgente', 'Urgente'
    
    # Basic Information
    solicitante = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='leave_requests',
        verbose_name='Solicitante'
    )
    
    tipo = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        verbose_name='Tipo de Solicitação'
    )
    
    # Request Details
    data_inicio = models.DateField(verbose_name='Data de Início')
    data_fim = models.DateField(verbose_name='Data de Fim')
    motivo = models.TextField(verbose_name='Motivo')
    observacoes = models.TextField(blank=True, verbose_name='Observações')

    # Vacation-specific fields
    dias_gozo = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name='Quantidade de Dias em Gozo',
        help_text='Número de dias que serão efetivamente gozados (apenas para férias)'
    )
    tem_abono_pecuniario = models.BooleanField(
        default=False,
        verbose_name='Há Venda do Abono Pecuniário?'
    )
    dias_abono_pecuniario = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name='Dias de Abono Pecuniário',
        help_text='Número de dias vendidos como abono pecuniário (máximo 10 dias)'
    )
    
    prioridade = models.CharField(
        max_length=10,
        choices=PriorityChoices.choices,
        default=PriorityChoices.MEDIA,
        verbose_name='Prioridade'
    )
    
    # Approval Workflow
    status = models.CharField(
        max_length=15,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDENTE,
        verbose_name='Status'
    )
    
    aprovador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_requests',
        verbose_name='Aprovador'
    )
    
    data_aprovacao = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de Aprovação'
    )
    
    comentario_aprovacao = models.TextField(
        blank=True,
        verbose_name='Comentário da Aprovação'
    )
    
    # Attachments
    anexo = models.FileField(
        upload_to='leave_requests/attachments/',
        null=True,
        blank=True,
        verbose_name='Anexo'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'leave_requests_leave_request'
        verbose_name = 'Solicitação de Afastamento'
        verbose_name_plural = 'Solicitações de Afastamento'
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return f"{self.solicitante} - {self.tipo.nome} ({self.data_inicio} a {self.data_fim})"
    
    def clean(self) -> None:
        """Validate the leave request"""
        super().clean()

        if self.data_inicio and self.data_fim:
            if self.data_fim < self.data_inicio:
                raise ValidationError({
                    'data_fim': 'Data de fim deve ser posterior à data de início.'
                })

            # Check if start date is in the past
            if self.data_inicio < date.today():
                raise ValidationError({
                    'data_inicio': 'Data de início não pode ser no passado.'
                })

            # Check minimum advance notice
            if self.tipo_id:
                dias_antecedencia = (self.data_inicio - date.today()).days
                if dias_antecedencia < self.tipo.antecedencia_minima:
                    raise ValidationError({
                        'data_inicio': f'Solicitação deve ser feita com {self.tipo.antecedencia_minima} dias de antecedência.'
                    })

        # Validate vacation-specific fields
        if self.tipo and ('rias' in self.tipo.nome.lower() or 'annual' in self.tipo.nome.lower()):
            if self.dias_gozo is None:
                raise ValidationError({
                    'dias_gozo': 'Dias em gozo é obrigatório para solicitações de férias.'
                })

            if self.dias_gozo <= 0:
                raise ValidationError({
                    'dias_gozo': 'Dias em gozo deve ser maior que zero.'
                })

            # Validate abono pecuniário
            if self.tem_abono_pecuniario:
                if self.dias_abono_pecuniario is None or self.dias_abono_pecuniario <= 0:
                    raise ValidationError({
                        'dias_abono_pecuniario': 'Número de dias de abono pecuniário deve ser informado quando há venda.'
                    })

                if self.dias_abono_pecuniario > 10:
                    raise ValidationError({
                        'dias_abono_pecuniario': 'Máximo de 10 dias podem ser vendidos como abono pecuniário.'
                    })

                # Check if total days don't exceed available vacation days (typically 30)
                total_dias = self.dias_gozo + self.dias_abono_pecuniario
                if total_dias > 30:
                    raise ValidationError({
                        'dias_abono_pecuniario': f'Total de dias (gozo + abono) não pode exceder 30 dias. Total atual: {total_dias} dias.'
                    })
            else:
                # If no abono pecuniário, clear the field
                self.dias_abono_pecuniario = None
    
    @property
    def dias_solicitados(self) -> int:
        """Calculate number of days requested"""
        if self.data_inicio and self.data_fim:
            return (self.data_fim - self.data_inicio).days + 1
        return 0

    def calcular_data_fim_automatica(self) -> Optional[date]:
        """Calculate end date based on dias_gozo (for vacation requests)"""
        if not self.data_inicio or not self.dias_gozo:
            return None

        # Only auto-calculate for vacation requests
        if not (self.tipo and ('rias' in self.tipo.nome.lower() or 'annual' in self.tipo.nome.lower())):
            return None

        # Calculate end date considering consecutive days (including weekends for vacation)
        # Vacation days are typically consecutive calendar days, not just business days
        return self.data_inicio + timedelta(days=self.dias_gozo - 1)

    def save(self, *args, **kwargs):
        """Override save to auto-calculate end date for vacation requests"""
        # Auto-calculate end date for vacation requests if not manually set
        if (self.tipo and ('rias' in self.tipo.nome.lower() or 'annual' in self.tipo.nome.lower())
            and self.dias_gozo and self.data_inicio):

            # Only auto-calculate if data_fim is not manually set or is inconsistent
            calculated_end = self.calcular_data_fim_automatica()
            if calculated_end and (not self.data_fim or self.data_fim != calculated_end):
                self.data_fim = calculated_end

        super().save(*args, **kwargs)
    
    @property
    def is_pending(self) -> bool:
        """Check if request is pending"""
        return self.status == self.StatusChoices.PENDENTE
    
    @property
    def is_approved(self) -> bool:
        """Check if request is approved"""
        return self.status == self.StatusChoices.APROVADA
    
    @property
    def is_rejected(self) -> bool:
        """Check if request is rejected"""
        return self.status == self.StatusChoices.REJEITADA
    
    def approve(self, aprovador, comentario: str = '') -> None:
        """Approve the leave request"""
        from django.utils import timezone
        
        self.status = self.StatusChoices.APROVADA
        self.aprovador = aprovador
        self.data_aprovacao = timezone.now()
        self.comentario_aprovacao = comentario
        self.save(update_fields=[
            'status', 'aprovador', 'data_aprovacao', 
            'comentario_aprovacao', 'updated_at'
        ])
    
    def reject(self, aprovador, comentario: str = '') -> None:
        """Reject the leave request"""
        from django.utils import timezone
        
        self.status = self.StatusChoices.REJEITADA
        self.aprovador = aprovador
        self.data_aprovacao = timezone.now()
        self.comentario_aprovacao = comentario
        self.save(update_fields=[
            'status', 'aprovador', 'data_aprovacao', 
            'comentario_aprovacao', 'updated_at'
        ])
    
    def cancel(self) -> None:
        """Cancel the leave request"""
        self.status = self.StatusChoices.CANCELADA
        self.save(update_fields=['status', 'updated_at'])


class LeaveBalance(models.Model):
    """
    Model to track employee leave balances by type
    """
    
    funcionario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='leave_balances',
        verbose_name='Funcionário'
    )
    
    tipo = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        verbose_name='Tipo de Solicitação'
    )
    
    ano = models.PositiveIntegerField(verbose_name='Ano')
    dias_disponiveis = models.PositiveIntegerField(
        default=0,
        verbose_name='Dias Disponíveis'
    )
    dias_utilizados = models.PositiveIntegerField(
        default=0,
        verbose_name='Dias Utilizados'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'leave_requests_leave_balance'
        verbose_name = 'Saldo de Afastamentos'
        verbose_name_plural = 'Saldos de Afastamentos'
        unique_together = ['funcionario', 'tipo', 'ano']
        ordering = ['-ano', 'tipo__nome']
    
    def __str__(self) -> str:
        return f"{self.funcionario} - {self.tipo.nome} {self.ano}"
    
    @property
    def dias_restantes(self) -> int:
        """Calculate remaining days"""
        return max(0, self.dias_disponiveis - self.dias_utilizados)
    
    def can_request_days(self, dias: int) -> bool:
        """Check if user can request specific number of days"""
        return self.dias_restantes >= dias
    
    def use_days(self, dias: int) -> None:
        """Use days from balance"""
        if self.can_request_days(dias):
            self.dias_utilizados += dias
            self.save(update_fields=['dias_utilizados', 'updated_at'])
        else:
            raise ValueError(f"Saldo insuficiente. Disponível: {self.dias_restantes}, Solicitado: {dias}")
    
    def return_days(self, dias: int) -> None:
        """Return days to balance (when request is cancelled/rejected)"""
        self.dias_utilizados = max(0, self.dias_utilizados - dias)
        self.save(update_fields=['dias_utilizados', 'updated_at'])
