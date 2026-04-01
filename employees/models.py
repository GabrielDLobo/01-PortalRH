from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from django.conf import settings
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
import os

User = get_user_model()


def employee_documents_upload_path(instance, filename):
    """Upload path for employee documents"""
    return f'employee_documents/{instance.employee.id}/{filename}'


class PreAdmissionRH(models.Model):
    """Model for HR pre-admission information"""
    
    CONTRACT_TYPE_CHOICES = [
        ('clt', 'CLT'),
        ('temporary', 'Temporário'),
        ('internship', 'Estágio'),
        ('freelancer', 'Freelancer'),
        ('pj', 'Pessoa Jurídica'),
    ]
    
    WORKLOAD_CHOICES = [
        ('20h', '20 horas semanais'),
        ('30h', '30 horas semanais'),
        ('40h', '40 horas semanais'),
        ('44h', '44 horas semanais'),
    ]
    
    # Informações básicas do funcionário para pré-admissão
    personal_email = models.EmailField(verbose_name="E-mail Pessoal do Colaborador", unique=True)
    full_name = models.CharField(max_length=255, verbose_name="Nome Completo")
    
    # Informações sobre o Cargo e Contrato
    position = models.CharField(max_length=200, verbose_name="Cargo")
    department = models.CharField(max_length=100, verbose_name="Departamento", blank=True)
    job_description = models.TextField(verbose_name="Descrição das Atividades")
    work_schedule = models.CharField(max_length=100, verbose_name="Horário de Trabalho")
    weekly_workload = models.CharField(
        max_length=10,
        choices=WORKLOAD_CHOICES,
        verbose_name="Jornada Semanal"
    )
    contract_type = models.CharField(
        max_length=20,
        choices=CONTRACT_TYPE_CHOICES,
        verbose_name="Tipo de Contrato"
    )
    salary = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Salário"
    )
    benefits = models.TextField(
        verbose_name="Benefícios (vale-transporte, refeição, plano de saúde, etc.)",
        blank=True
    )
    start_date = models.DateField(verbose_name="Data de Início")
    vacation_policy = models.TextField(
        verbose_name="Política de Férias e Banco de Horas",
        blank=True
    )
    direct_manager = models.CharField(
        max_length=255,
        verbose_name="Nome do Gestor Direto"
    )
    
    # Controle de sistema
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_pre_admissions',
        verbose_name="Criado por"
    )
    employee_user_created = models.BooleanField(
        default=False,
        verbose_name="Usuário do funcionário criado"
    )
    temporary_password = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Senha temporária"
    )
    email_sent = models.BooleanField(
        default=False,
        verbose_name="E-mail enviado"
    )
    employee = models.OneToOneField(
        'Employee',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='pre_admission_rh'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Pré-admissão RH"
        verbose_name_plural = "Pré-admissões RH"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Pré-admissão: {self.full_name} - {self.position}"
    
    def generate_temporary_password(self):
        """
        Gera uma senha temporária para o funcionário.
        
        A senha é gerada apenas uma vez e armazenada no banco de dados.
        Subsequentes chamadas retornam a mesma senha gerada.
        
        Returns:
            str: Senha temporária de 12 caracteres
        """
        if not self.temporary_password:
            self.temporary_password = get_random_string(length=12)
            self.save()
        return self.temporary_password
    
    def create_employee_user(self):
        """
        Cria a conta de usuário e perfil do funcionário no sistema.
        
        Este método:
        1. Gera uma senha temporária
        2. Cria uma conta de usuário com a senha temporária
        3. Cria um perfil de Employee associado
        4. Define que senha precisa ser trocada no primeiro login
        
        Returns:
            tuple: (User instance, Employee instance) ou (None, existing_employee)
        """
        if not self.employee_user_created:
            # Generate temporary password
            temp_password = self.generate_temporary_password()
            
            # Create user
            user = User.objects.create_user(
                username=self.personal_email,
                email=self.personal_email,
                password=temp_password,
                role='funcionario',
                first_name=self.full_name.split()[0],
                last_name=' '.join(self.full_name.split()[1:]) if len(self.full_name.split()) > 1 else ''
            )
            
            # Create employee profile
            employee = Employee.objects.create(
                user=user,
                full_name=self.full_name,
                email=self.personal_email,
                position=self.position,
                salary=self.salary,
                hire_date=self.start_date,
                status='pending',
                requires_password_change=True
            )
            
            self.employee = employee
            self.employee_user_created = True
            self.save()
            
            return user, employee
        return None, self.employee
    
    def send_admission_email(self):
        """
        Envia email de boas-vindas ao funcionário com credenciais de acesso.
        
        O email contém:
        - Instruções de login
        - Senha temporária
        - Informações do cargo
        - Data de início
        - Informações do gestor direto
        
        Returns:
            bool: True se email foi enviado com sucesso, False caso contrário
        """
        if not self.email_sent and self.employee_user_created:
            subject = "Bem-vindo(a) à empresa - Complete seu cadastro"
            message = f"""
Olá {self.full_name},

Bem-vindo(a) à nossa empresa!

Você foi pré-cadastrado(a) em nosso sistema de RH para o cargo de {self.position}.

Para completar seu processo de admissão, acesse nossa plataforma com os dados abaixo:

E-mail: {self.personal_email}
Senha temporária: {self.temporary_password}

Link de acesso: {settings.FRONTEND_URL}/login

IMPORTANTE: 
- No primeiro acesso, você será solicitado a trocar sua senha
- Após o login, complete todas as informações pessoais solicitadas
- Faça o upload dos documentos necessários

Informações sobre seu cargo:
- Cargo: {self.position}
- Data de início: {self.start_date.strftime('%d/%m/%Y')}
- Salário: R$ {self.salary}
- Gestor direto: {self.direct_manager}

Se tiver dúvidas, entre em contato com o RH.

Atenciosamente,
Equipe de Recursos Humanos
"""
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [self.personal_email],
                    fail_silently=False,
                )
                self.email_sent = True
                self.save()
                return True
            except Exception as e:
                print(f"Erro ao enviar email: {e}")
                return False
        return False


class Employee(models.Model):
    """Extended employee model with admission information"""
    
    MARITAL_STATUS_CHOICES = [
        ('single', 'Solteiro(a)'),
        ('married', 'Casado(a)'),
        ('divorced', 'Divorciado(a)'),
        ('widowed', 'Viúvo(a)'),
        ('stable_union', 'União Estável'),
    ]
    
    EDUCATION_LEVEL_CHOICES = [
        ('elementary', 'Ensino Fundamental'),
        ('high_school', 'Ensino Médio'),
        ('technical', 'Técnico'),
        ('undergraduate', 'Superior'),
        ('postgraduate', 'Pós-graduação'),
        ('masters', 'Mestrado'),
        ('doctorate', 'Doutorado'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Documentação Pendente'),
        ('under_review', 'Em Análise'),
        ('approved', 'Aprovado'),
        ('active', 'Ativo'),
        ('inactive', 'Inativo'),
    ]
    
    # Basic User Information
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    employee_id = models.CharField(max_length=20, unique=True, blank=True)
    
    # Personal Information
    full_name = models.CharField(max_length=255, verbose_name="Nome Completo", blank=True, null=True)
    cpf = models.CharField(
        max_length=14, 
        unique=True,
        verbose_name="CPF",
        blank=True, 
        null=True
    )
    rg = models.CharField(max_length=20, verbose_name="RG", blank=True, null=True)
    birth_date = models.DateField(verbose_name="Data de Nascimento", blank=True, null=True)
    marital_status = models.CharField(
        max_length=20, 
        choices=MARITAL_STATUS_CHOICES, 
        verbose_name="Estado Civil",
        blank=True, 
        null=True
    )
    
    # Contact Information
    phone = models.CharField(
        max_length=15,
        verbose_name="Telefone",
        blank=True, 
        null=True
    )
    email = models.EmailField(verbose_name="E-mail", blank=True, null=True)
    
    # Address Information
    street_address = models.CharField(max_length=255, verbose_name="Endereço", blank=True, null=True)
    address_number = models.CharField(max_length=10, verbose_name="Número", blank=True, null=True)
    address_complement = models.CharField(max_length=100, blank=True, verbose_name="Complemento")
    neighborhood = models.CharField(max_length=100, verbose_name="Bairro", blank=True, null=True)
    city = models.CharField(max_length=100, verbose_name="Cidade", blank=True, null=True)
    state = models.CharField(max_length=2, verbose_name="Estado", blank=True, null=True)
    zip_code = models.CharField(
        max_length=9,
        verbose_name="CEP",
        blank=True, 
        null=True
    )
    
    # Work Documents
    pis_pasep = models.CharField(
        max_length=15,
        verbose_name="PIS/PASEP",
        blank=True,
        null=True
    )
    work_card_number = models.CharField(max_length=20, verbose_name="Número da CTPS", blank=True, null=True)
    work_card_series = models.CharField(max_length=10, verbose_name="Série da CTPS", blank=True, null=True)
    
    # Education
    education_level = models.CharField(
        max_length=20,
        choices=EDUCATION_LEVEL_CHOICES,
        verbose_name="Escolaridade",
        blank=True, 
        null=True
    )
    
    # Banking Information
    bank_name = models.CharField(max_length=100, verbose_name="Nome do Banco", blank=True, null=True)
    bank_code = models.CharField(max_length=6, verbose_name="Código do Banco", blank=True, null=True)
    agency_number = models.CharField(max_length=10, verbose_name="Agência", blank=True, null=True)
    account_number = models.CharField(max_length=20, verbose_name="Conta", blank=True, null=True)
    account_type = models.CharField(
        max_length=20,
        choices=[('checking', 'Corrente'), ('savings', 'Poupança')],
        default='checking',
        verbose_name="Tipo de Conta"
    )
    
    # Work Information
    department = models.CharField(max_length=100, verbose_name="Departamento", blank=True)
    position = models.CharField(max_length=100, verbose_name="Cargo", blank=True)
    hire_date = models.DateField(null=True, blank=True, verbose_name="Data de Admissão")
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Salário")
    
    # Status and Control
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Status")
    admission_completed = models.BooleanField(default=False, verbose_name="Documentação Completa")
    requires_password_change = models.BooleanField(default=False, verbose_name="Requer Troca de Senha")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Funcionário"
        verbose_name_plural = "Funcionários"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} - {self.employee_id}"
    
    def save(self, *args, **kwargs):
        """
        Salva o funcionário no banco de dados.
        
        Auto-gera um ID único de funcionário no formato EMP-XXXX se não existir.
        O ID é incrementado sequencialmente baseado no último funcionário criado.
        """
        if not self.employee_id:
            # Generate employee ID
            last_employee = Employee.objects.order_by('-id').first()
            if last_employee:
                last_id = int(last_employee.employee_id.split('-')[1]) if '-' in last_employee.employee_id else 0
                self.employee_id = f"EMP-{last_id + 1:04d}"
            else:
                self.employee_id = "EMP-0001"
        super().save(*args, **kwargs)


class EmployeeDocument(models.Model):
    """Model for storing employee documents"""
    
    DOCUMENT_TYPE_CHOICES = [
        ('rg', 'RG'),
        ('birth_certificate', 'Certidão de Nascimento'),
        ('marriage_certificate', 'Certidão de Casamento'),
        ('education_certificate', 'Comprovante de Escolaridade'),
        ('work_card', 'Carteira de Trabalho'),
        ('work_contract', 'Contrato de Trabalho'),
        ('medical_exam', 'Exame Admissional'),
        ('bank_document', 'Comprovante Bancário'),
        ('address_proof', 'Comprovante de Endereço'),
        ('other', 'Outros'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPE_CHOICES, verbose_name="Tipo de Documento")
    document_name = models.CharField(max_length=255, verbose_name="Nome do Documento")
    file = models.FileField(upload_to=employee_documents_upload_path, verbose_name="Arquivo")
    file_size = models.PositiveIntegerField(verbose_name="Tamanho do Arquivo (bytes)")
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Upload")
    is_required = models.BooleanField(default=True, verbose_name="Documento Obrigatório")
    is_verified = models.BooleanField(default=False, verbose_name="Documento Verificado")
    
    class Meta:
        verbose_name = "Documento do Funcionário"
        verbose_name_plural = "Documentos dos Funcionários"
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.get_document_type_display()}"
    
    def save(self, *args, **kwargs):
        """
        Salva o documento do funcionário.
        
        Antes de salvar:
        - Calcula o tamanho do arquivo em bytes
        - Define o nome do documento a partir do nome do arquivo se não informado
        - Valida a integridade dos dados
        """
        try:
            if self.file:
                self.file_size = self.file.size
                
            # Ensure document_name is set if not provided
            if not self.document_name and self.file:
                self.document_name = self.file.name
                
            super().save(*args, **kwargs)
        except Exception as e:
            print(f"Error saving document: {e}")
            raise
    
    @property
    def file_extension(self):
        """Get file extension"""
        return os.path.splitext(self.file.name)[1].lower()
    
    @property
    def is_pdf(self):
        """Check if file is PDF"""
        return self.file_extension == '.pdf'
    
    @property
    def is_excel(self):
        """Check if file is Excel"""
        return self.file_extension in ['.xls', '.xlsx']
    
    @property
    def file_size_mb(self):
        """Get file size in MB"""
        return round(self.file_size / (1024 * 1024), 2) if self.file_size else 0


class AdmissionProcess(models.Model):
    """Model to track the admission process"""
    
    PROCESS_STATUS_CHOICES = [
        ('started', 'Iniciado'),
        ('documents_uploaded', 'Documentos Enviados'),
        ('under_review', 'Em Análise'),
        ('approved', 'Aprovado'),
        ('rejected', 'Rejeitado'),
        ('completed', 'Processo Concluído'),
    ]
    
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='admission_process')
    status = models.CharField(max_length=30, choices=PROCESS_STATUS_CHOICES, default='started')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, verbose_name="Observações")
    
    # Progress tracking
    personal_info_completed = models.BooleanField(default=False, verbose_name="Informações Pessoais Preenchidas")
    documents_uploaded = models.BooleanField(default=False, verbose_name="Documentos Enviados")
    hr_review_completed = models.BooleanField(default=False, verbose_name="Revisão RH Completa")
    
    class Meta:
        verbose_name = "Processo de Admissão"
        verbose_name_plural = "Processos de Admissão"
        ordering = ['-started_at']
    
    def __str__(self):
        return f"Admissão: {self.employee.full_name} - {self.get_status_display()}"
    
    @property
    def completion_percentage(self):
        """
        Calcula o percentual de conclusão do processo de admissão.
        
        Leva em conta:
        - Informações pessoais preenchidas (33%)
        - Documentos enviados (33%)
        - Revisão de RH completa (33%)
        
        Returns:
            float: Percentual de conclusão de 0 a 100
        """
        total_steps = 3
        completed_steps = sum([
            self.personal_info_completed,
            self.documents_uploaded,
            self.hr_review_completed
        ])
        return (completed_steps / total_steps) * 100