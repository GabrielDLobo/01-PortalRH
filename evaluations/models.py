from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from typing import Dict, Any, Optional


class EvaluationTemplate(models.Model):
    """
    Template for performance evaluations
    """
    
    nome = models.CharField(max_length=200, unique=True, verbose_name='Nome')
    descricao = models.TextField(blank=True, verbose_name='Descrição')
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'evaluations_evaluation_template'
        verbose_name = 'Template de Avaliação'
        verbose_name_plural = 'Templates de Avaliação'
        ordering = ['nome']
    
    def __str__(self) -> str:
        return self.nome


class EvaluationCriteria(models.Model):
    """
    Criteria for evaluations within a template
    """
    
    template = models.ForeignKey(
        EvaluationTemplate,
        on_delete=models.CASCADE,
        related_name='criteria',
        verbose_name='Template'
    )
    
    nome = models.CharField(max_length=200, verbose_name='Nome')
    descricao = models.TextField(blank=True, verbose_name='Descrição')
    peso = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('1.00'),
        validators=[
            MinValueValidator(Decimal('0.01')),
            MaxValueValidator(Decimal('10.00'))
        ],
        verbose_name='Peso',
        help_text='Peso do critério na avaliação final (1.00 = 100%)'
    )
    
    ordem = models.PositiveIntegerField(
        default=1,
        verbose_name='Ordem',
        help_text='Ordem de exibição do critério'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    
    class Meta:
        db_table = 'evaluations_evaluation_criteria'
        verbose_name = 'Critério de Avaliação'
        verbose_name_plural = 'Critérios de Avaliação'
        ordering = ['template', 'ordem']
        unique_together = ['template', 'nome']
    
    def __str__(self) -> str:
        return f"{self.template.nome} - {self.nome}"


class Evaluation(models.Model):
    """
    Performance evaluation model
    """
    
    class StatusChoices(models.TextChoices):
        RASCUNHO = 'rascunho', 'Rascunho'
        PENDENTE = 'pendente', 'Pendente'
        EM_ANDAMENTO = 'em_andamento', 'Em Andamento'
        CONCLUIDA = 'concluida', 'Concluída'
        APROVADA = 'aprovada', 'Aprovada'
        REJEITADA = 'rejeitada', 'Rejeitada'
    
    class TypeChoices(models.TextChoices):
        AUTO_AVALIACAO = 'auto_avaliacao', 'Auto-avaliação'
        AVALIACAO_SUPERIOR = 'avaliacao_superior', 'Avaliação do Superior'
        AVALIACAO_360 = 'avaliacao_360', 'Avaliação 360°'
        AVALIACAO_PARES = 'avaliacao_pares', 'Avaliação de Pares'
    
    # Basic Information
    template = models.ForeignKey(
        EvaluationTemplate,
        on_delete=models.CASCADE,
        verbose_name='Template'
    )
    
    avaliado = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='evaluations_received',
        verbose_name='Avaliado'
    )
    
    avaliador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='evaluations_given',
        verbose_name='Avaliador'
    )
    
    # Evaluation Details
    tipo = models.CharField(
        max_length=20,
        choices=TypeChoices.choices,
        default=TypeChoices.AVALIACAO_SUPERIOR,
        verbose_name='Tipo de Avaliação'
    )
    
    periodo_inicio = models.DateField(verbose_name='Início do Período')
    periodo_fim = models.DateField(verbose_name='Fim do Período')
    
    # Status and Workflow
    status = models.CharField(
        max_length=15,
        choices=StatusChoices.choices,
        default=StatusChoices.RASCUNHO,
        verbose_name='Status'
    )
    
    # Scoring
    nota_final = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal('0.00')),
            MaxValueValidator(Decimal('10.00'))
        ],
        verbose_name='Nota Final'
    )
    
    # Comments
    comentario_geral = models.TextField(
        blank=True,
        verbose_name='Comentário Geral'
    )
    
    pontos_fortes = models.TextField(
        blank=True,
        verbose_name='Pontos Fortes'
    )
    
    pontos_melhoria = models.TextField(
        blank=True,
        verbose_name='Pontos de Melhoria'
    )
    
    metas_objetivos = models.TextField(
        blank=True,
        verbose_name='Metas e Objetivos'
    )
    
    # Dates
    data_limite = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data Limite'
    )
    
    data_conclusao = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data de Conclusão'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'evaluations_evaluation'
        verbose_name = 'Avaliação'
        verbose_name_plural = 'Avaliações'
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return f"{self.avaliado} - {self.template.nome} ({self.periodo_inicio} a {self.periodo_fim})"
    
    @property
    def is_completed(self) -> bool:
        """Check if evaluation is completed"""
        return self.status in [
            self.StatusChoices.CONCLUIDA,
            self.StatusChoices.APROVADA
        ]
    
    @property
    def is_pending(self) -> bool:
        """Check if evaluation is pending"""
        return self.status == self.StatusChoices.PENDENTE
    
    def calculate_final_score(self) -> Optional[Decimal]:
        """Calculate final score based on criteria scores"""
        scores = self.scores.all()
        if not scores:
            return None
        
        total_weighted_score = Decimal('0.00')
        total_weight = Decimal('0.00')
        
        for score in scores:
            weighted_score = score.nota * score.criterio.peso
            total_weighted_score += weighted_score
            total_weight += score.criterio.peso
        
        if total_weight > 0:
            return total_weighted_score / total_weight
        
        return None
    
    def finalize_evaluation(self) -> None:
        """Finalize the evaluation by calculating final score"""
        from django.utils import timezone
        
        self.nota_final = self.calculate_final_score()
        self.status = self.StatusChoices.CONCLUIDA
        self.data_conclusao = timezone.now()
        self.save(update_fields=[
            'nota_final', 'status', 'data_conclusao', 'updated_at'
        ])
    
    def approve(self) -> None:
        """Approve the evaluation"""
        self.status = self.StatusChoices.APROVADA
        self.save(update_fields=['status', 'updated_at'])
    
    def reject(self) -> None:
        """Reject the evaluation"""
        self.status = self.StatusChoices.REJEITADA
        self.save(update_fields=['status', 'updated_at'])


class EvaluationScore(models.Model):
    """
    Individual criterion score within an evaluation
    """
    
    avaliacao = models.ForeignKey(
        Evaluation,
        on_delete=models.CASCADE,
        related_name='scores',
        verbose_name='Avaliação'
    )
    
    criterio = models.ForeignKey(
        EvaluationCriteria,
        on_delete=models.CASCADE,
        verbose_name='Critério'
    )
    
    nota = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal('0.00')),
            MaxValueValidator(Decimal('10.00'))
        ],
        verbose_name='Nota'
    )
    
    comentario = models.TextField(blank=True, verbose_name='Comentário')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'evaluations_evaluation_score'
        verbose_name = 'Pontuação da Avaliação'
        verbose_name_plural = 'Pontuações das Avaliações'
        unique_together = ['avaliacao', 'criterio']
        ordering = ['criterio__ordem']
    
    def __str__(self) -> str:
        return f"{self.avaliacao} - {self.criterio.nome}: {self.nota}"
    
    @property
    def weighted_score(self) -> Decimal:
        """Calculate weighted score"""
        return self.nota * self.criterio.peso


class EvaluationCycle(models.Model):
    """
    Evaluation cycles for organizing periodic evaluations
    """
    
    class StatusChoices(models.TextChoices):
        PLANEJADO = 'planejado', 'Planejado'
        ATIVO = 'ativo', 'Ativo'
        CONCLUIDO = 'concluido', 'Concluído'
        CANCELADO = 'cancelado', 'Cancelado'
    
    nome = models.CharField(max_length=200, verbose_name='Nome')
    descricao = models.TextField(blank=True, verbose_name='Descrição')
    
    data_inicio = models.DateField(verbose_name='Data de Início')
    data_fim = models.DateField(verbose_name='Data de Fim')
    
    template = models.ForeignKey(
        EvaluationTemplate,
        on_delete=models.CASCADE,
        verbose_name='Template Padrão'
    )
    
    status = models.CharField(
        max_length=15,
        choices=StatusChoices.choices,
        default=StatusChoices.PLANEJADO,
        verbose_name='Status'
    )
    
    # Participants
    funcionarios = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='EvaluationCycleParticipant',
        through_fields=('cycle', 'funcionario'),
        verbose_name='Funcionários'
    )
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_evaluation_cycles',
        verbose_name='Criado por'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'evaluations_evaluation_cycle'
        verbose_name = 'Ciclo de Avaliação'
        verbose_name_plural = 'Ciclos de Avaliação'
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return f"{self.nome} ({self.data_inicio} a {self.data_fim})"
    
    @property
    def is_active(self) -> bool:
        """Check if cycle is active"""
        return self.status == self.StatusChoices.ATIVO
    
    @property
    def participation_count(self) -> int:
        """Get number of participants"""
        return self.participants.count()
    
    def start_cycle(self) -> None:
        """Start the evaluation cycle"""
        self.status = self.StatusChoices.ATIVO
        self.save(update_fields=['status', 'updated_at'])
    
    def complete_cycle(self) -> None:
        """Complete the evaluation cycle"""
        self.status = self.StatusChoices.CONCLUIDO
        self.save(update_fields=['status', 'updated_at'])


class EvaluationCycleParticipant(models.Model):
    """
    Through model for evaluation cycle participants
    """
    
    cycle = models.ForeignKey(
        EvaluationCycle,
        on_delete=models.CASCADE,
        related_name='participants',
        verbose_name='Ciclo'
    )
    
    funcionario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='participating_in_cycles',
        verbose_name='Funcionário'
    )
    
    avaliador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='evaluating_in_cycles',
        verbose_name='Avaliador'
    )
    
    data_limite = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Data Limite'
    )
    
    concluido = models.BooleanField(default=False, verbose_name='Concluído')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    
    class Meta:
        db_table = 'evaluations_cycle_participant'
        verbose_name = 'Participante do Ciclo'
        verbose_name_plural = 'Participantes do Ciclo'
        unique_together = ['cycle', 'funcionario']
        ordering = ['funcionario__first_name', 'funcionario__last_name']
    
    def __str__(self) -> str:
        return f"{self.cycle.nome} - {self.funcionario.get_full_name() or self.funcionario.email}"
