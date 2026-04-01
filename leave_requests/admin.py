from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import LeaveType, LeaveRequest, LeaveBalance


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    """Leave Type Admin"""
    
    list_display = (
        'nome', 'max_dias_ano', 'requer_aprovacao', 
        'antecedencia_minima', 'ativo'
    )
    list_filter = ('requer_aprovacao', 'ativo', 'created_at')
    search_fields = ('nome', 'descricao')
    ordering = ('nome',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    """Leave Request Admin"""
    
    list_display = (
        'solicitante', 'tipo', 'data_inicio', 'data_fim',
        'dias_solicitados_display', 'status_display', 'prioridade', 'created_at'
    )
    list_filter = (
        'status', 'prioridade', 'tipo', 'data_inicio', 'created_at'
    )
    search_fields = (
        'solicitante__email', 'solicitante__first_name', 
        'solicitante__last_name', 'motivo'
    )
    ordering = ('-created_at',)
    readonly_fields = (
        'created_at', 'updated_at', 'data_aprovacao', 'dias_solicitados_display'
    )
    
    fieldsets = (
        ('Informações da Solicitação', {
            'fields': (
                'solicitante', 'tipo', 'prioridade'
            )
        }),
        ('Detalhes do Período', {
            'fields': (
                'data_inicio', 'data_fim', 'dias_solicitados_display', 
                'motivo', 'observacoes', 'anexo'
            )
        }),
        ('Aprovação', {
            'fields': (
                'status', 'aprovador', 'data_aprovacao', 'comentario_aprovacao'
            )
        }),
        ('Informações do Sistema', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_requests', 'reject_requests']
    
    def status_display(self, obj):
        """Display colored status"""
        colors = {
            'pendente': 'orange',
            'aprovada': 'green',
            'rejeitada': 'red',
            'cancelada': 'gray'
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def dias_solicitados_display(self, obj):
        """Display number of days requested"""
        return f"{obj.dias_solicitados} dias"
    dias_solicitados_display.short_description = 'Dias Solicitados'
    
    def approve_requests(self, request, queryset):
        """Action to approve multiple requests"""
        approved_count = 0
        for leave_request in queryset.filter(status='pendente'):
            leave_request.approve(request.user, 'Aprovado em massa pelo admin')
            approved_count += 1
        
        self.message_user(
            request,
            f'{approved_count} solicitações foram aprovadas.'
        )
    approve_requests.short_description = "Aprovar solicitações selecionadas"
    
    def reject_requests(self, request, queryset):
        """Action to reject multiple requests"""
        rejected_count = 0
        for leave_request in queryset.filter(status='pendente'):
            leave_request.reject(request.user, 'Rejeitado em massa pelo admin')
            rejected_count += 1
        
        self.message_user(
            request,
            f'{rejected_count} solicitações foram rejeitadas.'
        )
    reject_requests.short_description = "Rejeitar solicitações selecionadas"


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    """Leave Balance Admin"""
    
    list_display = (
        'funcionario', 'tipo', 'ano', 'dias_disponiveis',
        'dias_utilizados', 'dias_restantes_display'
    )
    list_filter = ('ano', 'tipo', 'created_at')
    search_fields = (
        'funcionario__email', 'funcionario__first_name',
        'funcionario__last_name', 'tipo__nome'
    )
    ordering = ('-ano', 'funcionario__email')
    readonly_fields = ('created_at', 'updated_at', 'dias_restantes_display')
    
    def dias_restantes_display(self, obj):
        """Display remaining days with color"""
        restantes = obj.dias_restantes
        if restantes == 0:
            color = 'red'
        elif restantes <= 5:
            color = 'orange'
        else:
            color = 'green'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} dias</span>',
            color,
            restantes
        )
    dias_restantes_display.short_description = 'Dias Restantes'
