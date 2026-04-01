from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from datetime import date, timedelta
from decimal import Decimal

from .models import Employee, PreAdmissionRH, EmployeeDocument, AdmissionProcess

User = get_user_model()


class EmployeeModelTestCase(TestCase):
    """Test cases for Employee model"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.user = User.objects.create_user(
            username='employee@test.com',
            email='employee@test.com',
            password='testpass123',
            role='funcionario'
        )
    
    def test_employee_creation(self):
        """Test basic employee creation"""
        employee = Employee.objects.create(
            user=self.user,
            full_name='João Silva',
            email='joao@test.com',
            position='Desenvolvedor',
            hire_date=date.today(),
            salary=Decimal('5000.00'),
            status='active'
        )
        
        self.assertEqual(employee.full_name, 'João Silva')
        self.assertEqual(employee.position, 'Desenvolvedor')
        self.assertTrue(employee.employee_id.startswith('EMP-'))
    
    def test_employee_id_auto_generation(self):
        """Test automatic employee ID generation"""
        emp1 = Employee.objects.create(
            user=self.user,
            full_name='Employee 1',
            position='Dev',
            hire_date=date.today()
        )
        
        user2 = User.objects.create_user(
            username='emp2@test.com',
            email='emp2@test.com',
            password='testpass123',
            role='funcionario'
        )
        
        emp2 = Employee.objects.create(
            user=user2,
            full_name='Employee 2',
            position='Dev',
            hire_date=date.today()
        )
        
        self.assertEqual(emp1.employee_id, 'EMP-0001')
        self.assertEqual(emp2.employee_id, 'EMP-0002')
    
    def test_employee_string_representation(self):
        """Test employee __str__ method"""
        employee = Employee.objects.create(
            user=self.user,
            full_name='Maria Santos',
            position='Analista',
            hire_date=date.today()
        )
        
        self.assertIn('Maria Santos', str(employee))
        self.assertIn('EMP-', str(employee))


class PreAdmissionRHModelTestCase(TestCase):
    """Test cases for PreAdmissionRH model"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.rh_user = User.objects.create_user(
            username='rh@test.com',
            email='rh@test.com',
            password='testpass123',
            role='rh'
        )
    
    def test_pre_admission_creation(self):
        """Test pre-admission creation"""
        pre_admission = PreAdmissionRH.objects.create(
            personal_email='novo.funcionario@test.com',
            full_name='Novo Funcionário',
            position='Gerente',
            department='TI',
            job_description='Gerenciar equipe de desenvolvimento',
            work_schedule='08:00 - 18:00',
            weekly_workload='40h',
            contract_type='clt',
            salary=Decimal('8000.00'),
            start_date=date.today() + timedelta(days=30),
            direct_manager='João Manager',
            created_by=self.rh_user
        )
        
        self.assertEqual(pre_admission.full_name, 'Novo Funcionário')
        self.assertEqual(pre_admission.position, 'Gerente')
        self.assertFalse(pre_admission.employee_user_created)
    
    def test_generate_temporary_password(self):
        """Test temporary password generation"""
        pre_admission = PreAdmissionRH.objects.create(
            personal_email='test.user@test.com',
            full_name='Test User',
            position='Dev',
            work_schedule='08:00 - 18:00',
            weekly_workload='40h',
            contract_type='clt',
            salary=Decimal('5000.00'),
            start_date=date.today() + timedelta(days=30),
            direct_manager='Manager',
            created_by=self.rh_user
        )
        
        password1 = pre_admission.generate_temporary_password()
        password2 = pre_admission.generate_temporary_password()
        
        self.assertEqual(password1, password2)
        self.assertEqual(len(password1), 12)


class EmployeeDocumentModelTestCase(TestCase):
    """Test cases for EmployeeDocument model"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.user = User.objects.create_user(
            username='emp@test.com',
            email='emp@test.com',
            password='testpass123',
            role='funcionario'
        )
        
        self.employee = Employee.objects.create(
            user=self.user,
            full_name='Employee With Docs',
            position='Dev',
            hire_date=date.today()
        )
    
    def test_document_creation(self):
        """Test employee document creation"""
        doc = EmployeeDocument.objects.create(
            employee=self.employee,
            document_type='rg',
            document_name='RG - 123456789',
            file_size=1024*512,  # 512KB
            is_required=True
        )
        
        self.assertEqual(doc.document_type, 'rg')
        self.assertFalse(doc.is_verified)
    
    def test_file_size_mb_property(self):
        """Test file size in MB calculation"""
        doc = EmployeeDocument.objects.create(
            employee=self.employee,
            document_type='work_contract',
            document_name='Contract.pdf',
            file_size=1024*1024*2,  # 2MB
        )
        
        self.assertEqual(doc.file_size_mb, 2.0)


class AdmissionProcessModelTestCase(TestCase):
    """Test cases for AdmissionProcess model"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.user = User.objects.create_user(
            username='admission@test.com',
            email='admission@test.com',
            password='testpass123',
            role='funcionario'
        )
        
        self.employee = Employee.objects.create(
            user=self.user,
            full_name='Employee Under Admission',
            position='Dev',
            hire_date=date.today()
        )
    
    def test_admission_process_creation(self):
        """Test admission process creation"""
        process = AdmissionProcess.objects.create(
            employee=self.employee,
            status='started'
        )
        
        self.assertEqual(process.status, 'started')
        self.assertEqual(process.completion_percentage, 0.0)
    
    def test_completion_percentage_calculation(self):
        """Test completion percentage calculation"""
        process = AdmissionProcess.objects.create(
            employee=self.employee,
            status='started',
            personal_info_completed=True,
            documents_uploaded=False,
            hr_review_completed=False
        )
        
        self.assertEqual(process.completion_percentage, 33.33333333333333)
