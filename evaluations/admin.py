from django.contrib import admin
from django.utils.html import format_html
from .models import (
    EvaluationTemplate, EvaluationCriteria, Evaluation, 
    EvaluationScore, EvaluationCycle, EvaluationCycleParticipant
)


class EvaluationCriteriaInline(admin.TabularInline):
    """Inline admin for evaluation criteria"""
    model = EvaluationCriteria
    extra = 1
    fields = ('nome', 'descricao', 'peso', 'ordem')
    ordering = ['ordem']


@admin.register(EvaluationTemplate)
class EvaluationTemplateAdmin(admin.ModelAdmin):
    """Evaluation Template Admin"""
    
    list_display = ('nome', 'criteria_count', 'ativo', 'created_at')
    list_filter = ('ativo', 'created_at')
    search_fields = ('nome', 'descricao')
    ordering = ('nome',)
    readonly_fields = ('created_at', 'updated_at', 'criteria_count')
    inlines = [EvaluationCriteriaInline]
    
    def criteria_count(self, obj):
        """Display number of criteria"""
        count = obj.criteria.count()
        return format_html(
            '<span style="color: {};">{} critérios</span>',
            'green' if count > 0 else 'red',
            count
        )
    criteria_count.short_description = 'Critérios'


class EvaluationScoreInline(admin.TabularInline):
    """Inline admin for evaluation scores"""
    model = EvaluationScore
    extra = 0
    fields = ('criterio', 'nota', 'comentario')
    readonly_fields = ('criterio',)
    can_delete = False


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    """Evaluation Admin"""
    
    list_display = (
        'avaliado', 'avaliador', 'template', 'tipo',
        'periodo_display', 'status_display', 'nota_final', 'created_at'
    )
    list_filter = (
        'status', 'tipo', 'template', 'periodo_inicio', 'created_at'
    )
    search_fields = (
        'avaliado__email', 'avaliado__first_name', 'avaliado__last_name',
        'avaliador__email', 'avaliador__first_name', 'avaliador__last_name'
    )
    ordering = ('-created_at',)
    readonly_fields = (
        'created_at', 'updated_at', 'data_conclusao', 'nota_final'
    )
    inlines = [EvaluationScoreInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': (
                'template', 'avaliado', 'avaliador', 'tipo'
            )
        }),
        ('Período', {
            'fields': ('periodo_inicio', 'periodo_fim')
        }),
        ('Status e Notas', {
            'fields': (
                'status', 'nota_final', 'data_limite', 'data_conclusao'
            )
        }),
        ('Comentários', {
            'fields': (
                'comentario_geral', 'pontos_fortes', 
                'pontos_melhoria', 'metas_objetivos'
            )
        }),
        ('Informações do Sistema', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['finalize_evaluations', 'approve_evaluations']
    
    def periodo_display(self, obj):
        """Display evaluation period"""
        return f"{obj.periodo_inicio} a {obj.periodo_fim}"
    periodo_display.short_description = 'Período'
    
    def status_display(self, obj):
        """Display colored status"""
        colors = {
            'rascunho': 'gray',
            'pendente': 'orange',
            'em_andamento': 'blue',
            'concluida': 'green',
            'aprovada': 'darkgreen',
            'rejeitada': 'red'
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def finalize_evaluations(self, request, queryset):
        """Action to finalize multiple evaluations"""
        finalized_count = 0
        for evaluation in queryset.filter(status='em_andamento'):
            evaluation.finalize_evaluation()
            finalized_count += 1
        
        self.message_user(
            request,
            f'{finalized_count} avaliações foram finalizadas.'
        )
    finalize_evaluations.short_description = "Finalizar avaliações selecionadas"
    
    def approve_evaluations(self, request, queryset):
        """Action to approve multiple evaluations"""
        approved_count = 0
        for evaluation in queryset.filter(status='concluida'):
            evaluation.approve()
            approved_count += 1
        
        self.message_user(
            request,
            f'{approved_count} avaliações foram aprovadas.'
        )
    approve_evaluations.short_description = "Aprovar avaliações selecionadas"


class EvaluationCycleParticipantInline(admin.TabularInline):
    """Inline admin for cycle participants"""
    model = EvaluationCycleParticipant
    extra = 1
    fields = ('funcionario', 'avaliador', 'data_limite', 'concluido')
    readonly_fields = ('concluido',)
    autocomplete_fields = ['funcionario', 'avaliador']


@admin.register(EvaluationCycle)
class EvaluationCycleAdmin(admin.ModelAdmin):
    """Evaluation Cycle Admin"""
    
    list_display = (
        'nome', 'periodo_display', 'template', 'status_display',
        'participants_count', 'created_by', 'created_at'
    )
    list_filter = ('status', 'template', 'data_inicio', 'created_at')
    search_fields = ('nome', 'descricao', 'created_by__email')
    ordering = ('-created_at',)
    readonly_fields = (
        'created_at', 'updated_at', 'participants_count'
    )
    inlines = [EvaluationCycleParticipantInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'descricao', 'template')
        }),
        ('Período', {
            'fields': ('data_inicio', 'data_fim')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Informações do Sistema', {
            'fields': ('created_by', 'participants_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['start_cycles', 'complete_cycles']
    
    def periodo_display(self, obj):
        """Display cycle period"""
        return f"{obj.data_inicio} a {obj.data_fim}"
    periodo_display.short_description = 'Período'
    
    def status_display(self, obj):
        """Display colored status"""
        colors = {
            'planejado': 'gray',
            'ativo': 'green',
            'concluido': 'blue',
            'cancelado': 'red'
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def participants_count(self, obj):
        """Display participants count"""
        count = obj.participation_count
        return format_html(
            '<span style="color: {};">{} participantes</span>',
            'green' if count > 0 else 'gray',
            count
        )
    participants_count.short_description = 'Participantes'
    
    def start_cycles(self, request, queryset):
        """Action to start multiple cycles"""
        started_count = 0
        for cycle in queryset.filter(status='planejado'):
            cycle.start_cycle()
            started_count += 1
        
        self.message_user(
            request,
            f'{started_count} ciclos foram iniciados.'
        )
    start_cycles.short_description = "Iniciar ciclos selecionados"
    
    def complete_cycles(self, request, queryset):
        """Action to complete multiple cycles"""
        completed_count = 0
        for cycle in queryset.filter(status='ativo'):
            cycle.complete_cycle()
            completed_count += 1
        
        self.message_user(
            request,
            f'{completed_count} ciclos foram concluídos.'
        )
    complete_cycles.short_description = "Concluir ciclos selecionados"
    
    def save_model(self, request, obj, form, change):
        """Set created_by to current user"""
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
