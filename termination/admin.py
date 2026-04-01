from django.contrib import admin
from .models import TerminationReason, TerminationRequest, TerminationDocument


@admin.register(TerminationReason)
class TerminationReasonAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nome', 'ativo']
    list_filter = ['ativo']
    search_fields = ['nome', 'codigo', 'descricao']
    ordering = ['codigo', 'nome']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Informações Básicas', {
            'fields': ('codigo', 'nome', 'descricao', 'ativo')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class TerminationDocumentInline(admin.TabularInline):
    model = TerminationDocument
    extra = 0
    readonly_fields = ['created_at', 'gerado_por']
    fields = ['tipo_documento', 'nome_arquivo', 'arquivo', 'gerado_automaticamente', 'gerado_por', 'created_at']


@admin.register(TerminationRequest)
class TerminationRequestAdmin(admin.ModelAdmin):
    list_display = [
        'funcionario', 'solicitante', 'motivo', 'data_ultimo_dia',
        'status', 'created_at'
    ]
    list_filter = [
        'status', 'motivo', 'created_at'
    ]
    search_fields = [
        'funcionario__first_name', 'funcionario__last_name',
        'funcionario__email', 'solicitante__first_name',
        'solicitante__last_name', 'justificativa'
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'created_at', 'updated_at', 'aprovador_rh',
        'data_aprovacao_rh'
    ]
    date_hierarchy = 'created_at'
    inlines = [TerminationDocumentInline]

    fieldsets = (
        ('Informações Básicas', {
            'fields': (
                'funcionario', 'solicitante', 'motivo',
                'data_ultimo_dia', 'data_desligamento'
            )
        }),
        ('Justificativa', {
            'fields': ('justificativa',)
        }),
        ('Status e Aprovação', {
            'fields': (
                'status', 'aprovador_rh', 'data_aprovacao_rh',
                'comentario_aprovacao_rh', 'observacoes_rh'
            )
        }),
        ('Documentos', {
            'fields': ('anexo_documentos',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        """Make certain fields readonly based on status"""
        readonly = list(self.readonly_fields)

        if obj and obj.status not in ['rascunho', 'rejeitada_rh']:
            readonly.extend([
                'funcionario', 'motivo', 'data_ultimo_dia', 'data_desligamento',
                'justificativa', 'anexo_documentos'
            ])

        return readonly

    actions = ['approve_requests', 'reject_requests']

    def approve_requests(self, request, queryset):
        """Bulk approve termination requests"""
        count = 0
        for termination_request in queryset.filter(status='pendente_rh'):
            termination_request.approve_by_hr(request.user)
            count += 1

        self.message_user(request, f'{count} solicitações foram aprovadas.')

    approve_requests.short_description = "Aprovar solicitações selecionadas"

    def reject_requests(self, request, queryset):
        """Bulk reject termination requests"""
        count = 0
        for termination_request in queryset.filter(status='pendente_rh'):
            termination_request.reject_by_hr(request.user, 'Rejeitado em massa pelo admin')
            count += 1

        self.message_user(request, f'{count} solicitações foram rejeitadas.')

    reject_requests.short_description = "Rejeitar solicitações selecionadas"


@admin.register(TerminationDocument)
class TerminationDocumentAdmin(admin.ModelAdmin):
    list_display = [
        'termination_request', 'tipo_documento', 'nome_arquivo',
        'gerado_automaticamente', 'gerado_por', 'created_at'
    ]
    list_filter = ['tipo_documento', 'gerado_automaticamente', 'created_at']
    search_fields = ['nome_arquivo', 'termination_request__funcionario__first_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']