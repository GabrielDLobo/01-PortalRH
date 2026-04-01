from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from typing import Optional


def employee_document_upload_path(instance: 'Employee', filename: str) -> str:
    """Generate upload path for employee documents"""
    return f'employees/{instance.id}/documents/{filename}'


class Employee(models.Model):
    """
    Employee model for managing staff information
    """
    
    class StatusChoices(models.TextChoices):
        ATIVO = 'ativo', 'Ativo'
        INATIVO = 'inativo', 'Inativo'
        FERIAS = 'ferias', 'Férias'
        AFASTADO = 'afastado', 'Afastado'
    
    # User relationship
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Usuário'
    )
    
    # Basic Information
    nome = models.CharField(max_length=200, verbose_name='Nome Completo')
    cargo = models.CharField(max_length=100, verbose_name='Cargo')
    setor = models.CharField(max_length=100, verbose_name='Setor')
    data_admissao = models.DateField(verbose_name='Data de Admissão')
    data_demissao = models.DateField(
        null=True, 
        blank=True, 
        verbose_name='Data de Demissão'
    )
    
    # Salary and Financial Info
    salario = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Salário'
    )
    
    # Personal Information
    cpf = models.CharField(max_length=11, unique=True, verbose_name='CPF')
    rg = models.CharField(max_length=20, verbose_name='RG')
    telefone = models.CharField(max_length=20, verbose_name='Telefone')
    endereco = models.TextField(verbose_name='Endereço')
    data_nascimento = models.DateField(verbose_name='Data de Nascimento')
    
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.ATIVO,
        verbose_name='Status'
    )
    
    # Additional Info
    observacoes = models.TextField(blank=True, verbose_name='Observações')
    foto = models.ImageField(
        upload_to='employees/photos/',
        null=True,
        blank=True,
        verbose_name='Foto'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'staff_employee'
        verbose_name = 'Funcionário'
        verbose_name_plural = 'Funcionários'
        ordering = ['nome']
    
    def __str__(self) -> str:
        return f"{self.nome} - {self.cargo}"
    
    @property
    def is_active(self) -> bool:
        """Check if employee is active"""
        return self.status == self.StatusChoices.ATIVO
    
    @property
    def years_of_service(self) -> int:
        """Calculate years of service"""
        from datetime import date
        end_date = self.data_demissao or date.today()
        return (end_date - self.data_admissao).days // 365
    
    def get_salary_display(self) -> str:
        """Get formatted salary display"""
        return f"R$ {self.salario:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')


class EmployeeDocument(models.Model):
    """
    Model for storing employee documents
    """
    
    class DocumentType(models.TextChoices):
        CONTRATO = 'contrato', 'Contrato de Trabalho'
        RG = 'rg', 'RG'
        CPF = 'cpf', 'CPF'
        TITULO_ELEITOR = 'titulo_eleitor', 'Título de Eleitor'
        CARTEIRA_TRABALHO = 'carteira_trabalho', 'Carteira de Trabalho'
        COMPROVANTE_RESIDENCIA = 'comprovante_residencia', 'Comprovante de Residência'
        DIPLOMA = 'diploma', 'Diploma'
        CERTIFICADO = 'certificado', 'Certificado'
        OUTROS = 'outros', 'Outros'
    
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name='Funcionário'
    )
    
    tipo = models.CharField(
        max_length=30,
        choices=DocumentType.choices,
        verbose_name='Tipo do Documento'
    )
    
    nome = models.CharField(max_length=200, verbose_name='Nome do Documento')
    arquivo = models.FileField(
        upload_to=employee_document_upload_path,
        verbose_name='Arquivo'
    )
    
    descricao = models.TextField(blank=True, verbose_name='Descrição')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Enviado por'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    
    class Meta:
        db_table = 'staff_employee_document'
        verbose_name = 'Documento do Funcionário'
        verbose_name_plural = 'Documentos dos Funcionários'
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return f"{self.employee.nome} - {self.nome}"


class Department(models.Model):
    """
    Department model for organizing employees
    """
    
    nome = models.CharField(max_length=100, unique=True, verbose_name='Nome')
    descricao = models.TextField(blank=True, verbose_name='Descrição')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'staff_department'
        verbose_name = 'Departamento'
        verbose_name_plural = 'Departamentos'
        ordering = ['nome']
    
    def __str__(self) -> str:
        return self.nome
    
    @property
    def employee_count(self) -> int:
        """Get number of employees in this department"""
        return Employee.objects.filter(setor=self.nome).count()
