from rest_framework import serializers
from decimal import Decimal
from .models import Employee, EmployeeDocument, Department
from accounts.serializers import UserSerializer


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Department serializer
    """
    employee_count = serializers.ReadOnlyField()

    class Meta:
        model = Department
        fields = [
            'id', 'nome', 'descricao',
            'employee_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'employee_count', 'created_at', 'updated_at']


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    """
    Employee document serializer
    """
    uploaded_by_name = serializers.CharField(
        source='uploaded_by.get_full_name', 
        read_only=True
    )
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = EmployeeDocument
        fields = [
            'id', 'employee', 'tipo', 'tipo_display', 'nome',
            'arquivo', 'descricao', 'uploaded_by', 'uploaded_by_name',
            'created_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'created_at']


class EmployeeListSerializer(serializers.ModelSerializer):
    """
    Employee list serializer - minimal fields for list views
    """
    user_email = serializers.CharField(source='user.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    salario_display = serializers.CharField(source='get_salary_display', read_only=True)
    years_of_service = serializers.ReadOnlyField()

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'user_email', 'nome', 'cargo', 'setor',
            'status', 'status_display', 'data_admissao', 'salario_display',
            'years_of_service'
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    """
    Employee detail serializer - complete information
    """
    user = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    salario_display = serializers.CharField(source='get_salary_display', read_only=True)
    years_of_service = serializers.ReadOnlyField()
    documents = EmployeeDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'user_id', 'nome', 'cargo', 'setor',
            'data_admissao', 'data_demissao', 'salario', 'salario_display',
            'cpf', 'rg', 'telefone', 'endereco', 'data_nascimento',
            'status', 'status_display',
            'observacoes', 'foto', 'years_of_service', 'documents',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'years_of_service', 'salario_display',
            'status_display', 'documents', 'created_at', 'updated_at'
        ]


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """
    Employee creation serializer
    """
    
    class Meta:
        model = Employee
        fields = [
            'user', 'nome', 'cargo', 'setor', 'data_admissao',
            'data_demissao', 'salario', 'cpf', 'rg', 'telefone',
            'endereco', 'data_nascimento', 'status',
            'observacoes', 'foto'
        ]
    
    def validate_cpf(self, value):
        """Validate CPF uniqueness"""
        if self.instance:
            # Update case - exclude current instance
            if Employee.objects.exclude(pk=self.instance.pk).filter(cpf=value).exists():
                raise serializers.ValidationError('CPF já cadastrado.')
        else:
            # Create case
            if Employee.objects.filter(cpf=value).exists():
                raise serializers.ValidationError('CPF já cadastrado.')
        return value
    
    def validate(self, attrs):
        """Additional validations"""
        # Check if user already has an employee record
        user = attrs.get('user')
        if user and not self.instance:
            if Employee.objects.filter(user=user).exists():
                raise serializers.ValidationError({
                    'user': 'Este usuário já possui um registro de funcionário.'
                })
        
        # Check admission date vs dismissal date
        data_admissao = attrs.get('data_admissao')
        data_demissao = attrs.get('data_demissao')
        
        if data_admissao and data_demissao:
            if data_demissao <= data_admissao:
                raise serializers.ValidationError({
                    'data_demissao': 'Data de demissão deve ser posterior à data de admissão.'
                })
        
        return attrs


class EmployeeUpdateSerializer(serializers.ModelSerializer):
    """
    Employee update serializer
    """
    
    class Meta:
        model = Employee
        fields = [
            'nome', 'cargo', 'setor', 'data_admissao', 'data_demissao',
            'salario', 'cpf', 'rg', 'telefone', 'endereco',
            'data_nascimento', 'status', 'observacoes', 'foto'
        ]
    
    def validate_cpf(self, value):
        """Validate CPF uniqueness"""
        if Employee.objects.exclude(pk=self.instance.pk).filter(cpf=value).exists():
            raise serializers.ValidationError('CPF já cadastrado.')
        return value


class EmployeeStatsSerializer(serializers.Serializer):
    """
    Employee statistics serializer
    """
    total_employees = serializers.IntegerField()
    active_employees = serializers.IntegerField()
    inactive_employees = serializers.IntegerField()
    employees_on_leave = serializers.IntegerField()
    departments_count = serializers.IntegerField()
    average_salary = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_years_service = serializers.DecimalField(max_digits=5, decimal_places=2)


class EmployeeSalaryUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating employee salary
    """
    new_salary = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2,
        min_value=Decimal('0.01')
    )
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)
    effective_date = serializers.DateField(required=False)
    
    def validate_new_salary(self, value):
        """Validate salary value"""
        if value <= 0:
            raise serializers.ValidationError('Salário deve ser maior que zero.')
        return value


class EmployeeStatusUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating employee status
    """
    new_status = serializers.ChoiceField(choices=Employee.StatusChoices.choices)
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)
    effective_date = serializers.DateField(required=False)