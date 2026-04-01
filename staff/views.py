from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Avg, Count
from decimal import Decimal

from .models import Employee, EmployeeDocument, Department
from .serializers import (
    EmployeeListSerializer, EmployeeDetailSerializer, EmployeeCreateSerializer,
    EmployeeUpdateSerializer, EmployeeDocumentSerializer, DepartmentSerializer,
    EmployeeStatsSerializer, EmployeeSalaryUpdateSerializer, 
    EmployeeStatusUpdateSerializer
)
from app.permissions import (
    IsAdminRH, CanViewEmployee, CanManageEmployee, IsStaffOrAdminRH
)


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing departments
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsStaffOrAdminRH]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'created_at']
    ordering = ['nome']
    
    def get_permissions(self):
        """Return appropriate permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminRH]
        else:
            permission_classes = [IsStaffOrAdminRH]
        
        return [permission() for permission in permission_classes]


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing employees
    """
    queryset = Employee.objects.select_related('user').prefetch_related('documents')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'setor', 'cargo']
    search_fields = ['nome', 'cpf', 'cargo', 'setor', 'user__email']
    ordering_fields = ['nome', 'data_admissao', 'salario', 'created_at']
    ordering = ['nome']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return EmployeeListSerializer
        elif self.action in ['retrieve']:
            return EmployeeDetailSerializer
        elif self.action == 'create':
            return EmployeeCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return EmployeeUpdateSerializer
        elif self.action == 'update_salary':
            return EmployeeSalaryUpdateSerializer
        elif self.action == 'update_status':
            return EmployeeStatusUpdateSerializer
        return EmployeeDetailSerializer
    
    def get_permissions(self):
        """Return appropriate permissions based on action"""
        # First check if user has basic staff access
        base_permissions = [IsStaffOrAdminRH]
        
        if self.action in ['list', 'retrieve']:
            permission_classes = base_permissions + [CanViewEmployee]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = base_permissions + [CanManageEmployee]
        elif self.action in ['stats', 'update_salary', 'update_status']:
            permission_classes = [IsAdminRH]
        else:
            permission_classes = base_permissions
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        
        if user.is_admin_rh:
            return self.queryset
        else:
            # Regular employees can only see themselves
            return self.queryset.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get employee statistics (Admin RH only)"""
        employees = Employee.objects.all()
        departments = Department.objects.all()
        
        # Calculate averages
        avg_salary = employees.aggregate(Avg('salario'))['salario__avg'] or Decimal('0.00')
        avg_years = sum(emp.years_of_service for emp in employees) / employees.count() if employees.exists() else 0
        
        stats = {
            'total_employees': employees.count(),
            'active_employees': employees.filter(status='ativo').count(),
            'inactive_employees': employees.filter(status='inativo').count(),
            'employees_on_leave': employees.filter(status='ferias').count(),
            'departments_count': departments.count(),
            'average_salary': avg_salary,
            'average_years_service': Decimal(str(avg_years))
        }
        
        serializer = EmployeeStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_salary(self, request, pk=None):
        """Update employee salary"""
        employee = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            new_salary = serializer.validated_data['new_salary']
            reason = serializer.validated_data.get('reason', '')
            
            # Update salary
            old_salary = employee.salario
            employee.salario = new_salary
            employee.save(update_fields=['salario', 'updated_at'])
            
            return Response({
                'message': 'Salário atualizado com sucesso.',
                'old_salary': old_salary,
                'new_salary': new_salary,
                'reason': reason
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update employee status"""
        employee = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            new_status = serializer.validated_data['new_status']
            reason = serializer.validated_data.get('reason', '')
            
            # Update status
            old_status = employee.status
            employee.status = new_status
            employee.save(update_fields=['status', 'updated_at'])
            
            return Response({
                'message': 'Status atualizado com sucesso.',
                'old_status': old_status,
                'new_status': new_status,
                'reason': reason
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def my_info(self, request):
        """Get current user's employee information"""
        try:
            employee = Employee.objects.get(user=request.user)
            serializer = EmployeeDetailSerializer(employee)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response({
                'detail': 'Registro de funcionário não encontrado.'
            }, status=status.HTTP_404_NOT_FOUND)


class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing employee documents
    """
    queryset = EmployeeDocument.objects.select_related('employee', 'uploaded_by')
    serializer_class = EmployeeDocumentSerializer
    permission_classes = [IsStaffOrAdminRH]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['employee', 'tipo']
    search_fields = ['nome', 'descricao']
    ordering_fields = ['created_at', 'nome']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """Return appropriate permissions based on action"""
        # First check if user has basic staff access
        base_permissions = [IsStaffOrAdminRH]
        
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = base_permissions + [CanManageEmployee]
        else:
            permission_classes = base_permissions + [CanViewEmployee]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        
        if user.is_admin_rh:
            return self.queryset
        else:
            # Regular employees can only see their own documents
            return self.queryset.filter(employee__user=user)
    
    def perform_create(self, serializer):
        """Set uploaded_by to current user"""
        serializer.save(uploaded_by=self.request.user)
