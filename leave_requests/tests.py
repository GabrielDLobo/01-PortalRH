from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from datetime import date, timedelta

from .models import LeaveType, LeaveRequest

User = get_user_model()


class LeaveTypeModelTestCase(TestCase):
    """Test cases for LeaveType model"""
    
    def test_leave_type_creation(self):
        """Test basic leave type creation"""
        leave_type = LeaveType.objects.create(
            nome='Férias',
            descricao='Direito anual de férias',
            max_dias_ano=30,
            requer_aprovacao=False,
            antecedencia_minima=30
        )
        
        self.assertEqual(leave_type.nome, 'Férias')
        self.assertEqual(leave_type.max_dias_ano, 30)
        self.assertFalse(leave_type.requer_aprovacao)
    
    def test_leave_type_uniqueness(self):
        """Test leave type name uniqueness"""
        LeaveType.objects.create(
            nome='Atestado Médico',
            max_dias_ano=30,
            antecedencia_minima=0
        )
        
        with self.assertRaises(Exception):  # IntegrityError
            LeaveType.objects.create(
                nome='Atestado Médico',
                max_dias_ano=30,
                antecedencia_minima=0
            )


class LeaveRequestModelTestCase(TestCase):
    """Test cases for LeaveRequest model"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.user = User.objects.create_user(
            username='employee@test.com',
            email='employee@test.com',
            password='testpass123',
            role='funcionario'
        )
        
        self.approver = User.objects.create_user(
            username='manager@test.com',
            email='manager@test.com',
            password='testpass123',
            role='gerente'
        )
        
        self.leave_type = LeaveType.objects.create(
            nome='Férias',
            max_dias_ano=30,
            antecedencia_minima=30
        )
    
    def test_leave_request_creation(self):
        """Test basic leave request creation"""
        future_date = date.today() + timedelta(days=45)
        future_end = future_date + timedelta(days=9)  # 10 days inclusive
        
        request = LeaveRequest.objects.create(
            solicitante=self.user,
            tipo=self.leave_type,
            data_inicio=future_date,
            data_fim=future_end,
            motivo='Descanso e lazer',
            dias_gozo=10,
            status='pendente'
        )
        
        self.assertEqual(request.status, 'pendente')
        self.assertEqual(request.dias_solicitados, 10)
    
    def test_leave_request_start_date_in_past_validation(self):
        """Test validation for past start dates"""
        past_date = date.today() - timedelta(days=5)
        
        request = LeaveRequest(
            solicitante=self.user,
            tipo=self.leave_type,
            data_inicio=past_date,
            data_fim=past_date + timedelta(days=5),
            motivo='Invalid'
        )
        
        with self.assertRaises(ValidationError):
            request.full_clean()
    
    def test_leave_request_end_before_start_validation(self):
        """Test validation for end date before start date"""
        future_date = date.today() + timedelta(days=45)
        
        request = LeaveRequest(
            solicitante=self.user,
            tipo=self.leave_type,
            data_inicio=future_date,
            data_fim=future_date - timedelta(days=5),
            motivo='Invalid'
        )
        
        with self.assertRaises(ValidationError):
            request.full_clean()
    
    def test_leave_request_minimum_advance_notice(self):
        """Test validation for minimum advance notice"""
        # Leave type requires 30 days notice, but we request only 10 days ahead
        future_date = date.today() + timedelta(days=10)
        
        request = LeaveRequest(
            solicitante=self.user,
            tipo=self.leave_type,
            data_inicio=future_date,
            data_fim=future_date + timedelta(days=5),
            motivo='Too short notice',
            dias_gozo=5
        )
        
        with self.assertRaises(ValidationError):
            request.full_clean()
    
    def test_leave_request_dias_solicitados(self):
        """Test calculation of requested days"""
        start = date.today() + timedelta(days=45)
        end = start + timedelta(days=4)  # 5 days total
        
        request = LeaveRequest.objects.create(
            solicitante=self.user,
            tipo=self.leave_type,
            data_inicio=start,
            data_fim=end,
            motivo='Test',
            dias_gozo=5
        )
        
        self.assertEqual(request.dias_solicitados, 5)
    
    def test_leave_request_is_pending(self):
        """Test is_pending property"""
        future_date = date.today() + timedelta(days=45)
        
        request = LeaveRequest.objects.create(
            solicitante=self.user,
            tipo=self.leave_type,
            data_inicio=future_date,
            data_fim=future_date + timedelta(days=10),
            motivo='Test',
            dias_gozo=10,
            status='pendente'
        )
        
        self.assertTrue(request.is_pending)
        
        request.status = 'aprovada'
        self.assertFalse(request.is_pending)
    
    def test_leave_request_abono_pecuniario_validation(self):
        """Test abono pecuniário validation"""
        future_date = date.today() + timedelta(days=45)
        
        # Test that abono pecuniário can't exceed 10 days
        request = LeaveRequest(
            solicitante=self.user,
            tipo=self.leave_type,
            data_inicio=future_date,
            data_fim=future_date + timedelta(days=25),
            motivo='Test vacation with abono',
            dias_gozo=20,
            tem_abono_pecuniario=True,
            dias_abono_pecuniario=15  # Exceeds 10 day limit
        )
        
        with self.assertRaises(ValidationError):
            request.full_clean()
