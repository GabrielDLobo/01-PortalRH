from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from datetime import date, timedelta
from typing import Optional
from decimal import Decimal


class TerminationReason(models.Model):
    """
    Model for different types/reasons of termination
    """

    nome = models.CharField(max_length=100, unique=True, verbose_name='Nome')
    codigo = models.CharField(max_length=10, unique=True, verbose_name='Código')
    descricao = models.TextField(blank=True, verbose_name='Descrição')
    ativo = models.BooleanField(default=True, verbose_name='Ativo')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        db_table = 'termination_termination_reason'
        verbose_name = 'Motivo de Desligamento'
        verbose_name_plural = 'Motivos de Desligamento'
        ordering = ['nome']

    def __str__(self) -> str:
        return f"{self.codigo} - {self.nome}"


class TerminationRequest(models.Model):
    """
    Model for termination requests with approval workflow
    """

    class StatusChoices(models.TextChoices):
        RASCUNHO = 'rascunho', 'Rascunho'
        PENDENTE_RH = 'pendente_rh', 'Pendente Análise RH'
        APROVADA_RH = 'aprovada_rh', 'Aprovada pelo RH'
        REJEITADA_RH = 'rejeitada_rh', 'Rejeitada pelo RH'
        PROCESSANDO = 'processando', 'Processando Rescisão'
        CONCLUIDA = 'concluida', 'Concluída'
        CANCELADA = 'cancelada', 'Cancelada'


    # Basic Information
    funcionario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='termination_requests',
        verbose_name='Funcionário'
    )

    solicitante = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='requested_terminations',
        verbose_name='Solicitante (Gestor)'
    )

    motivo = models.ForeignKey(
        TerminationReason,
        on_delete=models.CASCADE,
        verbose_name='Motivo do Desligamento'
    )

    # Termination Details
    data_ultimo_dia = models.DateField(verbose_name='Último Dia de Trabalho')
    data_desligamento = models.DateField(
        help_text='Data oficial do desligamento',
        verbose_name='Data de Desligamento'
    )

    # Justification and Documentation
    justificativa = models.TextField(
        max_length=2000,
        verbose_name='Justificativa Detalhada',
        help_text='Descreva detalhadamente os motivos que levaram ao desligamento'
    )


    observacoes_rh = models.TextField(
        blank=True,
        max_length=1000,
        verbose_name='Observações do RH'
    )



    status = models.CharField(
        max_length=15,
        choices=StatusChoices.choices,
        default=StatusChoices.RASCUNHO,
        verbose_name='Status'
    )

    # Approval Information
    aprovador_rh = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_terminations',
        verbose_name='Aprovador RH'
    )

    data_aprovacao_rh = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de Aprovação RH'
    )

    comentario_aprovacao_rh = models.TextField(
        blank=True,
        verbose_name='Comentário da Aprovação RH'
    )


    # Attachments
    anexo_documentos = models.FileField(
        upload_to='termination/documents/',
        null=True,
        blank=True,
        verbose_name='Documentos Anexos',
        help_text='Anexe documentos comprobatórios (advertências, cartas, etc.)'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        db_table = 'termination_termination_request'
        verbose_name = 'Solicitação de Desligamento'
        verbose_name_plural = 'Solicitações de Desligamento'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"Desligamento: {self.funcionario} - {self.motivo.nome} ({self.get_status_display()})"

    def clean(self) -> None:
        """Validate the termination request"""
        super().clean()

        if self.data_ultimo_dia and self.data_desligamento:
            if self.data_desligamento < self.data_ultimo_dia:
                raise ValidationError({
                    'data_desligamento': 'Data de desligamento deve ser igual ou posterior ao último dia de trabalho.'
                })


    @property
    def is_draft(self) -> bool:
        """Check if request is in draft"""
        return self.status == self.StatusChoices.RASCUNHO

    @property
    def is_pending_hr(self) -> bool:
        """Check if request is pending HR approval"""
        return self.status == self.StatusChoices.PENDENTE_RH

    @property
    def is_approved(self) -> bool:
        """Check if request is approved by HR"""
        return self.status == self.StatusChoices.APROVADA_RH

    @property
    def is_completed(self) -> bool:
        """Check if termination is completed"""
        return self.status == self.StatusChoices.CONCLUIDA

    @property
    def can_be_edited(self) -> bool:
        """Check if request can still be edited"""
        return self.status in [self.StatusChoices.RASCUNHO, self.StatusChoices.REJEITADA_RH]


    def submit_for_approval(self) -> None:
        """Submit request for HR approval"""
        if self.status == self.StatusChoices.RASCUNHO:
            self.status = self.StatusChoices.PENDENTE_RH
            self.save(update_fields=['status', 'updated_at'])

    def approve_by_hr(self, aprovador, comentario: str = '') -> None:
        """Approve the termination request by HR"""
        from django.utils import timezone

        self.status = self.StatusChoices.APROVADA_RH
        self.aprovador_rh = aprovador
        self.data_aprovacao_rh = timezone.now()
        self.comentario_aprovacao_rh = comentario
        self.save(update_fields=[
            'status', 'aprovador_rh', 'data_aprovacao_rh',
            'comentario_aprovacao_rh', 'updated_at'
        ])

    def reject_by_hr(self, aprovador, comentario: str = '') -> None:
        """Reject the termination request by HR"""
        from django.utils import timezone

        self.status = self.StatusChoices.REJEITADA_RH
        self.aprovador_rh = aprovador
        self.data_aprovacao_rh = timezone.now()
        self.comentario_aprovacao_rh = comentario
        self.save(update_fields=[
            'status', 'aprovador_rh', 'data_aprovacao_rh',
            'comentario_aprovacao_rh', 'updated_at'
        ])

    def start_processing(self) -> None:
        """Start processing the termination (calculations, documents)"""
        if self.status == self.StatusChoices.APROVADA_RH:
            self.status = self.StatusChoices.PROCESSANDO
            self.save(update_fields=['status', 'updated_at'])

    def complete_termination(self) -> None:
        """Complete the termination process"""
        if self.status == self.StatusChoices.PROCESSANDO:
            self.status = self.StatusChoices.CONCLUIDA
            self.save(update_fields=['status', 'updated_at'])

    def cancel(self) -> None:
        """Cancel the termination request"""
        if self.can_be_edited:
            self.status = self.StatusChoices.CANCELADA
            self.save(update_fields=['status', 'updated_at'])


class TerminationDocument(models.Model):
    """
    Model for documents generated during termination process
    """

    class DocumentTypeChoices(models.TextChoices):
        OUTROS = 'outros', 'Kit Demissional'

    termination_request = models.ForeignKey(
        TerminationRequest,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name='Solicitação de Desligamento'
    )

    tipo_documento = models.CharField(
        max_length=20,
        choices=DocumentTypeChoices.choices,
        verbose_name='Tipo de Documento'
    )

    nome_arquivo = models.CharField(
        max_length=255,
        verbose_name='Nome do Arquivo'
    )

    arquivo = models.FileField(
        upload_to='termination/generated_documents/',
        verbose_name='Arquivo'
    )

    gerado_automaticamente = models.BooleanField(
        default=False,
        verbose_name='Gerado Automaticamente'
    )

    gerado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Gerado por'
    )

    observacoes = models.TextField(
        blank=True,
        verbose_name='Observações'
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        db_table = 'termination_termination_document'
        verbose_name = 'Documento de Desligamento'
        verbose_name_plural = 'Documentos de Desligamento'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.get_tipo_documento_display()} - {self.nome_arquivo}"