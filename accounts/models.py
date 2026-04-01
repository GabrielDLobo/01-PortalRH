from django.contrib.auth.models import AbstractUser
from django.db import models
from typing import Optional


class User(AbstractUser):
    """
    Custom User model with role-based access control for PortalRH
    """
    
    class UserRole(models.TextChoices):
        ADMIN_RH = 'admin_rh', 'Administrador RH'
        FUNCIONARIO = 'funcionario', 'Funcionário'
    
    email = models.EmailField(unique=True, verbose_name='Email')
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.FUNCIONARIO,
        verbose_name='Perfil'
    )
    is_active = models.BooleanField(default=True, verbose_name='Ativo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'accounts_user'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['email']
    
    def __str__(self) -> str:
        return f"{self.email} ({self.get_role_display()})"
    
    @property
    def is_admin_rh(self) -> bool:
        """Check if user has admin RH role"""
        return self.role == self.UserRole.ADMIN_RH
    
    
    @property
    def is_funcionario(self) -> bool:
        """Check if user has employee role"""
        return self.role == self.UserRole.FUNCIONARIO
    
    def has_perm_for_employee(self, employee_id: Optional[int] = None) -> bool:
        """
        Check if user has permission to access employee data
        """
        if self.is_admin_rh:
            return True
        
        if employee_id is None:
            return False
            
        
        # Funcionários can only access their own data
        if self.is_funcionario:
            from staff.models import Employee
            try:
                employee = Employee.objects.get(id=employee_id)
                return employee.user_id == self.id
            except Employee.DoesNotExist:
                return False
        
        return False
