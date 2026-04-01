from django.contrib import admin
from django.utils.html import format_html
from .models import Employee, EmployeeDocument, Department


class EmployeeDocumentInline(admin.TabularInline):
    """Inline admin for employee documents"""
    model = EmployeeDocument
    extra = 1
    fields = ('tipo', 'nome', 'arquivo', 'descricao')
    readonly_fields = ('created_at',)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    """Employee Admin"""
    
    list_display = (
        'nome', 'cargo', 'setor', 'status',
        'data_admissao', 'salario_display'
    )
    list_filter = ('status', 'setor', 'cargo', 'data_admissao')
    search_fields = ('nome', 'cpf', 'cargo', 'setor')
    ordering = ('nome',)
    readonly_fields = ('created_at', 'updated_at', 'years_of_service')
    inlines = [EmployeeDocumentInline]
    
    fieldsets = (
        ('Informações do Usuário', {
            'fields': ('user',)
        }),
        ('Informações Pessoais', {
            'fields': (
                'nome', 'cpf', 'rg', 'data_nascimento', 
                'telefone', 'endereco', 'foto'
            )
        }),
        ('Informações Profissionais', {
            'fields': (
                'cargo', 'setor', 'data_admissao', 'data_demissao',
                'salario', 'status'
            )
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Informações do Sistema', {
            'fields': ('created_at', 'updated_at', 'years_of_service'),
            'classes': ('collapse',)
        }),
    )
    
    def salario_display(self, obj):
        """Display formatted salary"""
        return obj.get_salary_display()
    salario_display.short_description = 'Salário'
    
    def years_of_service(self, obj):
        """Display years of service"""
        return f"{obj.years_of_service} anos"
    years_of_service.short_description = 'Tempo de Serviço'


@admin.register(EmployeeDocument)
class EmployeeDocumentAdmin(admin.ModelAdmin):
    """Employee Document Admin"""
    
    list_display = ('employee', 'nome', 'tipo', 'uploaded_by', 'created_at')
    list_filter = ('tipo', 'created_at')
    search_fields = ('employee__nome', 'nome', 'tipo')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    
    def save_model(self, request, obj, form, change):
        """Set uploaded_by to current user"""
        if not change:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Department Admin"""
    
    list_display = ('nome', 'employee_count_display', 'created_at')
    search_fields = ('nome', 'descricao')
    ordering = ('nome',)
    readonly_fields = ('created_at', 'updated_at', 'employee_count_display')
    
    def employee_count_display(self, obj):
        """Display employee count"""
        count = obj.employee_count
        return format_html(
            '<span style="color: {};">{} funcionários</span>',
            'green' if count > 0 else 'gray',
            count
        )
    employee_count_display.short_description = 'Funcionários'
