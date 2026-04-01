from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Employee, EmployeeDocument, AdmissionProcess, PreAdmissionRH

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'username']


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.ReadOnlyField()
    file_extension = serializers.ReadOnlyField()
    is_pdf = serializers.ReadOnlyField()
    is_excel = serializers.ReadOnlyField()
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    
    class Meta:
        model = EmployeeDocument
        fields = [
            'id', 'document_type', 'document_type_display', 'document_name', 
            'file', 'file_size', 'file_size_mb', 'file_extension',
            'is_pdf', 'is_excel', 'uploaded_at', 'is_required', 'is_verified'
        ]
        read_only_fields = ['id', 'file_size', 'uploaded_at']


class AdmissionProcessSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    completion_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = AdmissionProcess
        fields = [
            'id', 'status', 'status_display', 'started_at', 'completed_at',
            'notes', 'personal_info_completed', 'documents_uploaded',
            'hr_review_completed', 'completion_percentage'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at']


class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    documents = EmployeeDocumentSerializer(many=True, read_only=True)
    admission_process = AdmissionProcessSerializer(read_only=True)
    marital_status_display = serializers.CharField(source='get_marital_status_display', read_only=True)
    education_level_display = serializers.CharField(source='get_education_level_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    account_type_display = serializers.CharField(source='get_account_type_display', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            # Basic Info
            'id', 'user', 'employee_id', 'status', 'status_display',
            'admission_completed', 'created_at', 'updated_at',
            
            # Personal Information
            'full_name', 'cpf', 'rg', 'birth_date', 'marital_status',
            'marital_status_display',
            
            # Contact Information
            'phone', 'email',
            
            # Address Information
            'street_address', 'address_number', 'address_complement',
            'neighborhood', 'city', 'state', 'zip_code',
            
            # Work Documents
            'pis_pasep', 'work_card_number', 'work_card_series',
            
            # Education
            'education_level', 'education_level_display',
            
            # Banking Information
            'bank_name', 'bank_code', 'agency_number', 'account_number',
            'account_type', 'account_type_display',
            
            # Work Information
            'department', 'position', 'hire_date', 'salary',
            
            # Relations
            'documents', 'admission_process'
        ]
        read_only_fields = ['id', 'employee_id', 'created_at', 'updated_at']


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new employee records during admission"""
    
    # Add optional CPF and RG fields that can be combined from frontend rg_cpf
    rg_cpf = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Employee
        fields = [
            # Personal Information
            'full_name', 'cpf', 'rg', 'rg_cpf', 'birth_date', 'marital_status',
            
            # Contact Information
            'phone', 'email',
            
            # Address Information
            'street_address', 'address_number', 'address_complement',
            'neighborhood', 'city', 'state', 'zip_code',
            
            # Work Documents
            'pis_pasep', 'work_card_number', 'work_card_series',
            
            # Education
            'education_level',
            
            # Banking Information
            'bank_name', 'bank_code', 'agency_number', 'account_number',
            'account_type',
        ]
        extra_kwargs = {
            'full_name': {'required': False, 'allow_blank': True},
            'cpf': {'required': False, 'allow_blank': True},
            'rg': {'required': False, 'allow_blank': True},
            'birth_date': {'required': False, 'allow_null': True},
            'marital_status': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_blank': True},
            'street_address': {'required': False, 'allow_blank': True},
            'address_number': {'required': False, 'allow_blank': True},
            'neighborhood': {'required': False, 'allow_blank': True},
            'city': {'required': False, 'allow_blank': True},
            'state': {'required': False, 'allow_blank': True},
            'zip_code': {'required': False, 'allow_blank': True},
            'education_level': {'required': False, 'allow_blank': True},
            'bank_name': {'required': False, 'allow_blank': True},
            'bank_code': {'required': False, 'allow_blank': True},
            'agency_number': {'required': False, 'allow_blank': True},
            'account_number': {'required': False, 'allow_blank': True},
        }
    
    def validate(self, attrs):
        """Custom validation to handle rg_cpf field and other requirements"""
        
        # Handle rg_cpf field - split into cpf and rg if provided
        rg_cpf = attrs.pop('rg_cpf', None)
        if rg_cpf and rg_cpf.strip():
            # If it looks like CPF (has dots and dash), use as CPF
            if '.' in rg_cpf and '-' in rg_cpf:
                attrs['cpf'] = rg_cpf.strip()
            else:
                # Otherwise treat as RG
                attrs['rg'] = rg_cpf.strip()
        
        # Validate phone format if provided
        phone = attrs.get('phone')
        if phone and phone.strip():
            # Remove common separators and validate basic format
            clean_phone = phone.replace('(', '').replace(')', '').replace('-', '').replace(' ', '')
            if len(clean_phone) < 10:
                raise serializers.ValidationError({
                    'phone': 'Telefone deve ter pelo menos 10 dígitos.'
                })
        
        # Validate ZIP code format if provided
        zip_code = attrs.get('zip_code')
        if zip_code and zip_code.strip():
            clean_zip = zip_code.replace('-', '').replace('.', '').replace(' ', '')
            if len(clean_zip) != 8 or not clean_zip.isdigit():
                raise serializers.ValidationError({
                    'zip_code': 'CEP deve ter 8 dígitos no formato XXXXX-XXX.'
                })
            # Format ZIP code properly
            attrs['zip_code'] = f"{clean_zip[:5]}-{clean_zip[5:]}"
        
        return attrs
    
    def validate_cpf(self, value):
        """Validate CPF format and uniqueness"""
        if value and value.strip():
            # Check if already exists (exclude current instance if updating)
            queryset = Employee.objects.filter(cpf=value.strip())
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError("CPF já está cadastrado no sistema.")
        return value
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if value and value.strip():
            # Check if already exists (exclude current instance if updating)
            queryset = Employee.objects.filter(email=value.strip())
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError("E-mail já está cadastrado no sistema.")
        return value


class DocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer specifically for document uploads"""
    
    class Meta:
        model = EmployeeDocument
        fields = ['document_type', 'document_name', 'file', 'is_required']
        extra_kwargs = {
            'document_name': {'required': True},
            'document_type': {'required': True},
            'file': {'required': True},
            'is_required': {'default': True}
        }
    
    def validate_file(self, value):
        """Validate file type and size"""
        if not value:
            raise serializers.ValidationError("Arquivo é obrigatório.")
            
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError("Arquivo muito grande. Tamanho máximo: 10MB")
        
        # Check file extension
        allowed_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png']
        file_name = value.name.lower()
        file_extension = '.' + file_name.split('.')[-1] if '.' in file_name else ''
        
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"Tipo de arquivo não permitido. Formatos aceitos: {', '.join(allowed_extensions)}"
            )
        
        return value


class PreAdmissionRHSerializer(serializers.ModelSerializer):
    """Serializer for HR pre-admission process"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    contract_type_display = serializers.CharField(source='get_contract_type_display', read_only=True)
    weekly_workload_display = serializers.CharField(source='get_weekly_workload_display', read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    
    class Meta:
        model = PreAdmissionRH
        fields = [
            'id',
            # Basic employee info
            'personal_email', 'full_name',
            
            # Job and contract information
            'position', 'department', 'job_description', 'work_schedule', 
            'weekly_workload', 'weekly_workload_display',
            'contract_type', 'contract_type_display',
            'salary', 'benefits', 'start_date',
            'vacation_policy', 'direct_manager',
            
            # System control
            'created_by', 'created_by_name',
            'employee_user_created', 'email_sent',
            'employee', 'employee_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_by_name', 
            'employee_user_created', 'email_sent', 
            'employee', 'employee_name', 
            'created_at', 'updated_at'
        ]
    
    def validate_personal_email(self, value):
        """Validate email uniqueness in pre-admission and user systems"""
        # Check if email already exists in pre-admission
        if self.instance:
            # For updates, exclude current instance
            if PreAdmissionRH.objects.filter(personal_email=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Este e-mail já está cadastrado em outro pré-cadastro.")
        else:
            # For creation, check if email exists
            if PreAdmissionRH.objects.filter(personal_email=value).exists():
                raise serializers.ValidationError("Este e-mail já está cadastrado em outro pré-cadastro.")
        
        # Check if email already exists in user system
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já possui uma conta no sistema.")
        
        return value
    
    def validate_salary(self, value):
        """Validate salary is positive"""
        if value <= 0:
            raise serializers.ValidationError("O salário deve ser maior que zero.")
        return value