from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from typing import Dict, Any, List, Optional
import uuid
from datetime import timedelta

User = get_user_model()


class ReportCategory(models.Model):
    """
    Categories for organizing reports
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    description = models.TextField(blank=True, verbose_name="Descrição")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Ícone")
    color = models.CharField(max_length=7, default="#007bff", verbose_name="Cor")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Categoria de Relatório"
        verbose_name_plural = "Categorias de Relatórios"
        ordering = ['name']

    def __str__(self) -> str:
        return self.name


class ReportTemplate(models.Model):
    """
    Template model for creating customizable reports
    """

    class ReportTypeChoices(models.TextChoices):
        EMPLOYEES = 'employees', 'Relatório de Funcionários'
        TERMINATIONS = 'terminations', 'Relatório de Desligamentos'
        EVALUATIONS = 'evaluations', 'Relatório de Avaliações'
        LEAVE_REQUESTS = 'leave_requests', 'Relatório de Solicitações de Férias'
        ADMISSIONS = 'admissions', 'Relatório de Admissões'
        DASHBOARD = 'dashboard', 'Dashboard Resumo'
        CUSTOM = 'custom', 'Relatório Personalizado'

    class OutputFormatChoices(models.TextChoices):
        JSON = 'json', 'JSON'
        PDF = 'pdf', 'PDF'
        EXCEL = 'excel', 'Excel'
        CSV = 'csv', 'CSV'

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name="Nome do Relatório")
    description = models.TextField(blank=True, verbose_name="Descrição")
    report_type = models.CharField(
        max_length=20,
        choices=ReportTypeChoices.choices,
        verbose_name="Tipo de Relatório"
    )
    category = models.ForeignKey(
        ReportCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Categoria"
    )

    # Configuration
    query_config = models.JSONField(
        default=dict,
        verbose_name="Configuração da Query",
        help_text="Configurações para filtros, ordenação e campos"
    )
    output_formats = models.JSONField(
        default=list,
        verbose_name="Formatos de Saída",
        help_text="Lista de formatos suportados: ['json', 'pdf', 'excel', 'csv']"
    )
    default_format = models.CharField(
        max_length=10,
        choices=OutputFormatChoices.choices,
        default=OutputFormatChoices.JSON,
        verbose_name="Formato Padrão"
    )

    # Display Configuration
    columns_config = models.JSONField(
        default=dict,
        verbose_name="Configuração de Colunas",
        help_text="Configuração de quais colunas exibir e como formatá-las"
    )
    chart_config = models.JSONField(
        default=dict,
        verbose_name="Configuração de Gráficos",
        help_text="Configurações para gráficos e visualizações"
    )

    # Permissions and Access
    is_public = models.BooleanField(default=False, verbose_name="Público")
    allowed_users = models.ManyToManyField(
        User,
        blank=True,
        related_name='allowed_reports',
        verbose_name="Usuários Permitidos"
    )
    allowed_roles = models.JSONField(
        default=list,
        verbose_name="Perfis Permitidos",
        help_text="Lista de perfis que podem acessar este relatório"
    )

    # Cache Configuration
    cache_duration = models.IntegerField(
        default=300,  # 5 minutes
        verbose_name="Duração do Cache (segundos)"
    )
    enable_cache = models.BooleanField(default=True, verbose_name="Habilitar Cache")

    # Metadata
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_report_templates',
        verbose_name="Criado por"
    )
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    version = models.IntegerField(default=1, verbose_name="Versão")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Template de Relatório"
        verbose_name_plural = "Templates de Relatórios"
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['report_type', 'is_active']),
            models.Index(fields=['created_by', 'is_active']),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.get_report_type_display()})"

    def can_access(self, user: User) -> bool:
        """Check if user can access this report template"""
        if self.is_public:
            return True

        if user == self.created_by:
            return True

        if self.allowed_users.filter(id=user.id).exists():
            return True

        if user.role in self.allowed_roles:
            return True

        return False

    @property
    def cache_key(self) -> str:
        """Generate cache key for this template"""
        return f"report_template_{self.id}_v{self.version}"


class ReportExecution(models.Model):
    """
    Model to track report executions and store results
    """

    class StatusChoices(models.TextChoices):
        PENDING = 'pending', 'Pendente'
        RUNNING = 'running', 'Executando'
        COMPLETED = 'completed', 'Concluído'
        FAILED = 'failed', 'Falhou'
        CANCELLED = 'cancelled', 'Cancelado'

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(
        ReportTemplate,
        on_delete=models.CASCADE,
        related_name='executions',
        verbose_name="Template"
    )
    executed_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='report_executions',
        verbose_name="Executado por"
    )

    # Execution Configuration
    parameters = models.JSONField(
        default=dict,
        verbose_name="Parâmetros",
        help_text="Parâmetros específicos desta execução"
    )
    output_format = models.CharField(
        max_length=10,
        choices=ReportTemplate.OutputFormatChoices.choices,
        verbose_name="Formato de Saída"
    )

    # Status and Results
    status = models.CharField(
        max_length=15,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
        verbose_name="Status"
    )
    result_data = models.JSONField(
        default=dict,
        verbose_name="Dados do Resultado",
        help_text="Resultado da execução em formato JSON"
    )
    file_path = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Caminho do Arquivo",
        help_text="Caminho para arquivo gerado (PDF, Excel, etc.)"
    )

    # Execution Metrics
    execution_time_seconds = models.FloatField(
        null=True,
        blank=True,
        verbose_name="Tempo de Execução (segundos)"
    )
    rows_processed = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="Linhas Processadas"
    )
    error_message = models.TextField(
        blank=True,
        verbose_name="Mensagem de Erro"
    )

    # Timestamps
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # File Management
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Expira em",
        help_text="Data de expiração do arquivo gerado"
    )

    class Meta:
        verbose_name = "Execução de Relatório"
        verbose_name_plural = "Execuções de Relatórios"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['template', 'status']),
            models.Index(fields=['executed_by', 'created_at']),
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self) -> str:
        return f"{self.template.name} - {self.get_status_display()} ({self.created_at.strftime('%d/%m/%Y %H:%M')})"

    def start_execution(self) -> None:
        """Mark execution as started"""
        self.status = self.StatusChoices.RUNNING
        self.started_at = timezone.now()
        self.save(update_fields=['status', 'started_at', 'updated_at'])

    def complete_execution(
        self,
        result_data: Dict[str, Any] = None,
        file_path: str = None,
        rows_processed: int = None
    ) -> None:
        """Mark execution as completed"""
        self.status = self.StatusChoices.COMPLETED
        self.completed_at = timezone.now()

        if result_data is not None:
            self.result_data = result_data

        if file_path:
            self.file_path = file_path
            # Set expiration date (7 days from now)
            self.expires_at = timezone.now() + timedelta(days=7)

        if rows_processed is not None:
            self.rows_processed = rows_processed

        if self.started_at:
            self.execution_time_seconds = (
                self.completed_at - self.started_at
            ).total_seconds()

        self.save()

    def fail_execution(self, error_message: str) -> None:
        """Mark execution as failed"""
        self.status = self.StatusChoices.FAILED
        self.completed_at = timezone.now()
        self.error_message = error_message

        if self.started_at:
            self.execution_time_seconds = (
                self.completed_at - self.started_at
            ).total_seconds()

        self.save()

    @property
    def is_expired(self) -> bool:
        """Check if execution result has expired"""
        return self.expires_at and timezone.now() > self.expires_at

    @property
    def cache_key(self) -> str:
        """Generate cache key for this execution"""
        return f"report_execution_{self.id}"


class ReportSchedule(models.Model):
    """
    Model for scheduling automatic report generation
    """

    class FrequencyChoices(models.TextChoices):
        DAILY = 'daily', 'Diário'
        WEEKLY = 'weekly', 'Semanal'
        MONTHLY = 'monthly', 'Mensal'
        QUARTERLY = 'quarterly', 'Trimestral'
        YEARLY = 'yearly', 'Anual'
        CUSTOM = 'custom', 'Personalizado'

    class StatusChoices(models.TextChoices):
        ACTIVE = 'active', 'Ativo'
        PAUSED = 'paused', 'Pausado'
        DISABLED = 'disabled', 'Desabilitado'

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name="Nome do Agendamento")
    template = models.ForeignKey(
        ReportTemplate,
        on_delete=models.CASCADE,
        related_name='schedules',
        verbose_name="Template"
    )

    # Schedule Configuration
    frequency = models.CharField(
        max_length=15,
        choices=FrequencyChoices.choices,
        verbose_name="Frequência"
    )
    cron_expression = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Expressão Cron",
        help_text="Para frequência personalizada (formato: min hour day month weekday)"
    )

    # Execution Configuration
    output_format = models.CharField(
        max_length=10,
        choices=ReportTemplate.OutputFormatChoices.choices,
        verbose_name="Formato de Saída"
    )
    parameters = models.JSONField(
        default=dict,
        verbose_name="Parâmetros",
        help_text="Parâmetros fixos para execução automática"
    )

    # Notification Configuration
    email_recipients = models.JSONField(
        default=list,
        verbose_name="Destinatários de Email",
        help_text="Lista de emails para envio do relatório"
    )
    send_email_on_success = models.BooleanField(
        default=True,
        verbose_name="Enviar Email em Sucesso"
    )
    send_email_on_failure = models.BooleanField(
        default=True,
        verbose_name="Enviar Email em Falha"
    )

    # Status and Control
    status = models.CharField(
        max_length=15,
        choices=StatusChoices.choices,
        default=StatusChoices.ACTIVE,
        verbose_name="Status"
    )

    # Schedule Tracking
    last_execution = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Última Execução"
    )
    next_execution = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Próxima Execução"
    )
    execution_count = models.IntegerField(
        default=0,
        verbose_name="Contagem de Execuções"
    )
    success_count = models.IntegerField(
        default=0,
        verbose_name="Sucessos"
    )
    failure_count = models.IntegerField(
        default=0,
        verbose_name="Falhas"
    )

    # Metadata
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_report_schedules',
        verbose_name="Criado por"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Agendamento de Relatório"
        verbose_name_plural = "Agendamentos de Relatórios"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'next_execution']),
            models.Index(fields=['template', 'status']),
        ]

    def __str__(self) -> str:
        return f"{self.name} - {self.get_frequency_display()}"

    def calculate_next_execution(self) -> Optional[timezone.datetime]:
        """Calculate next execution time based on frequency"""
        from datetime import datetime, timedelta

        now = timezone.now()

        if self.frequency == self.FrequencyChoices.DAILY:
            return now + timedelta(days=1)
        elif self.frequency == self.FrequencyChoices.WEEKLY:
            return now + timedelta(weeks=1)
        elif self.frequency == self.FrequencyChoices.MONTHLY:
            return now + timedelta(days=30)  # Approximation
        elif self.frequency == self.FrequencyChoices.QUARTERLY:
            return now + timedelta(days=90)  # Approximation
        elif self.frequency == self.FrequencyChoices.YEARLY:
            return now + timedelta(days=365)  # Approximation
        elif self.frequency == self.FrequencyChoices.CUSTOM and self.cron_expression:
            # This would need a cron parser library in a real implementation
            # For now, return None to indicate manual calculation needed
            return None

        return None

    def record_execution(self, success: bool = True) -> None:
        """Record an execution and update counters"""
        self.last_execution = timezone.now()
        self.execution_count += 1

        if success:
            self.success_count += 1
        else:
            self.failure_count += 1

        # Calculate next execution
        self.next_execution = self.calculate_next_execution()

        self.save(update_fields=[
            'last_execution', 'execution_count', 'success_count',
            'failure_count', 'next_execution', 'updated_at'
        ])

    @property
    def success_rate(self) -> float:
        """Calculate success rate percentage"""
        if self.execution_count == 0:
            return 0.0
        return (self.success_count / self.execution_count) * 100


class ReportBookmark(models.Model):
    """
    Model for users to bookmark frequently used reports
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='report_bookmarks',
        verbose_name="Usuário"
    )
    template = models.ForeignKey(
        ReportTemplate,
        on_delete=models.CASCADE,
        related_name='bookmarks',
        verbose_name="Template"
    )
    name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Nome Personalizado"
    )
    parameters = models.JSONField(
        default=dict,
        verbose_name="Parâmetros Salvos"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Favorito de Relatório"
        verbose_name_plural = "Favoritos de Relatórios"
        unique_together = ['user', 'template']
        ordering = ['-updated_at']

    def __str__(self) -> str:
        display_name = self.name or self.template.name
        return f"{self.user.get_full_name()} - {display_name}"
