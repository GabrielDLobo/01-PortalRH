from django.contrib import admin
from .models import Employee, EmployeeDocument, AdmissionProcess, PreAdmissionRH


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = [
        'employee_id', 'full_name', 'email', 'department', 
        'position', 'status', 'admission_completed', 'created_at'
    ]
    list_filter = ['status', 'department', 'admission_completed', 'marital_status', 'education_level']
    search_fields = ['full_name', 'cpf', 'email', 'employee_id']
    readonly_fields = ['employee_id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('user', 'employee_id', 'status', 'admission_completed')
        }),
        ('Informações Pessoais', {
            'fields': ('full_name', 'cpf', 'rg', 'birth_date', 'marital_status')
        }),
        ('Contato', {
            'fields': ('phone', 'email')
        }),
        ('Endereço', {
            'fields': (
                'street_address', 'address_number', 'address_complement',
                'neighborhood', 'city', 'state', 'zip_code'
            )
        }),
        ('Documentos de Trabalho', {
            'fields': ('pis_pasep', 'work_card_number', 'work_card_series')
        }),
        ('Escolaridade', {
            'fields': ('education_level',)
        }),
        ('Informações Bancárias', {
            'fields': ('bank_name', 'bank_code', 'agency_number', 'account_number', 'account_type')
        }),
        ('Informações de Trabalho', {
            'fields': ('department', 'position', 'hire_date', 'salary')
        }),
        ('Controle', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(EmployeeDocument)
class EmployeeDocumentAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'document_type', 'document_name', 
        'file_size_mb', 'is_required', 'is_verified', 'uploaded_at'
    ]
    list_filter = ['document_type', 'is_required', 'is_verified', 'uploaded_at']
    search_fields = ['employee__full_name', 'document_name']
    readonly_fields = ['file_size', 'uploaded_at']
    
    def file_size_mb(self, obj):
        return f"{obj.file_size_mb} MB"
    file_size_mb.short_description = 'Tamanho'


class EmployeeDocumentInline(admin.TabularInline):
    model = EmployeeDocument
    extra = 0
    readonly_fields = ['file_size', 'uploaded_at']


@admin.register(AdmissionProcess)
class AdmissionProcessAdmin(admin.ModelAdmin):
    list_display = [
        'employee', 'status', 'completion_percentage',
        'personal_info_completed', 'documents_uploaded', 
        'hr_review_completed', 'started_at'
    ]
    list_filter = [
        'status', 'personal_info_completed', 
        'documents_uploaded', 'hr_review_completed'
    ]
    search_fields = ['employee__full_name']
    readonly_fields = ['started_at', 'completion_percentage']
    
    def completion_percentage(self, obj):
        return f"{obj.completion_percentage:.0f}%"
    completion_percentage.short_description = 'Progresso'


# Customize Employee admin to include documents inline
EmployeeAdmin.inlines = [EmployeeDocumentInline]


@admin.register(PreAdmissionRH)
class PreAdmissionRHAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'personal_email', 'position', 'salary',
        'start_date', 'employee_user_created', 'email_sent', 'created_at'
    ]
    list_filter = [
        'contract_type', 'weekly_workload', 'employee_user_created', 
        'email_sent', 'start_date', 'created_at'
    ]
    search_fields = ['full_name', 'personal_email', 'position', 'direct_manager']
    readonly_fields = [
        'created_by', 'employee_user_created', 'temporary_password',
        'email_sent', 'employee', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('personal_email', 'full_name')
        }),
        ('Informações do Cargo e Contrato', {
            'fields': (
                'position', 'job_description', 'work_schedule', 
                'weekly_workload', 'contract_type', 'salary',
                'benefits', 'start_date', 'vacation_policy', 'direct_manager'
            )
        }),
        ('Controle do Sistema', {
            'fields': (
                'created_by', 'employee_user_created', 'temporary_password',
                'email_sent', 'employee', 'created_at', 'updated_at'
            )
        }),
    )
    
    actions = ['create_employee_accounts', 'resend_emails']
    
    def create_employee_accounts(self, request, queryset):
        """Action to create employee accounts for selected pre-admissions"""
        created_count = 0
        for pre_admission in queryset:
            if not pre_admission.employee_user_created:
                try:
                    user, employee = pre_admission.create_employee_user()
                    if user:
                        pre_admission.send_admission_email()
                        created_count += 1
                except Exception as e:
                    self.message_user(request, f"Erro ao criar conta para {pre_admission.full_name}: {str(e)}")
        
        if created_count > 0:
            self.message_user(request, f"{created_count} conta(s) criada(s) com sucesso!")
    
    create_employee_accounts.short_description = "Criar contas de funcionário selecionadas"
    
    def resend_emails(self, request, queryset):
        """Action to resend emails for selected pre-admissions"""
        sent_count = 0
        for pre_admission in queryset:
            if pre_admission.employee_user_created:
                pre_admission.email_sent = False
                pre_admission.save()
                if pre_admission.send_admission_email():
                    sent_count += 1
        
        if sent_count > 0:
            self.message_user(request, f"{sent_count} email(s) reenviado(s) com sucesso!")
    
    resend_emails.short_description = "Reenviar e-mails selecionados"