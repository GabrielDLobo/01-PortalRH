from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from decimal import Decimal

from .models import EvaluationTemplate, EvaluationCriteria, Evaluation

User = get_user_model()


class EvaluationTemplateTestCase(TestCase):
    """Test cases for EvaluationTemplate model"""
    
    def test_template_creation(self):
        """Test basic template creation"""
        template = EvaluationTemplate.objects.create(
            nome='Avaliação Anual',
            descricao='Avaliação de desempenho anual',
            ativo=True
        )
        
        self.assertEqual(template.nome, 'Avaliação Anual')
        self.assertTrue(template.ativo)
    
    def test_template_uniqueness(self):
        """Test template name uniqueness"""
        EvaluationTemplate.objects.create(
            nome='Template Único',
            ativo=True
        )
        
        with self.assertRaises(Exception):  # IntegrityError
            EvaluationTemplate.objects.create(
                nome='Template Único',
                ativo=True
            )


class EvaluationCriteriaTestCase(TestCase):
    """Test cases for EvaluationCriteria model"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.template = EvaluationTemplate.objects.create(
            nome='Template Test',
            ativo=True
        )
    
    def test_criteria_creation(self):
        """Test basic criteria creation"""
        criteria = EvaluationCriteria.objects.create(
            template=self.template,
            nome='Produtividade',
            descricao='Avaliação de produtividade',
            peso=Decimal('2.50'),
            ordem=1
        )
        
        self.assertEqual(criteria.nome, 'Produtividade')
        self.assertEqual(criteria.peso, Decimal('2.50'))
    
    def test_criteria_unique_together(self):
        """Test unique constraint on template + nome"""
        EvaluationCriteria.objects.create(
            template=self.template,
            nome='Critério 1',
            peso=Decimal('1.00')
        )
        
        with self.assertRaises(Exception):  # IntegrityError
            EvaluationCriteria.objects.create(
                template=self.template,
                nome='Critério 1',
                peso=Decimal('1.50')
            )


class EvaluationTestCase(TestCase):
    """Test cases for Evaluation model"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.evaluator = User.objects.create_user(
            username='manager@test.com',
            email='manager@test.com',
            password='testpass123',
            role='gerente'
        )
        
        self.evaluated = User.objects.create_user(
            username='employee@test.com',
            email='employee@test.com',
            password='testpass123',
            role='funcionario'
        )
        
        self.template = EvaluationTemplate.objects.create(
            nome='Annual Evaluation',
            ativo=True
        )
    
    def test_evaluation_creation(self):
        """Test basic evaluation creation"""
        start_date = date.today() - timedelta(days=365)
        end_date = date.today()
        
        evaluation = Evaluation.objects.create(
            template=self.template,
            avaliado=self.evaluated,
            avaliador=self.evaluator,
            tipo='avaliacao_superior',
            periodo_inicio=start_date,
            periodo_fim=end_date,
            status='rascunho',
            comentario_geral='Bom desempenho'
        )
        
        self.assertEqual(evaluation.status, 'rascunho')
        self.assertEqual(evaluation.avaliado, self.evaluated)
        self.assertIsNone(evaluation.nota_final)
    
    def test_evaluation_nota_final_validation(self):
        """Test evaluation final score is between 0 and 10"""
        start_date = date.today() - timedelta(days=365)
        end_date = date.today()
        
        evaluation = Evaluation.objects.create(
            template=self.template,
            avaliado=self.evaluated,
            avaliador=self.evaluator,
            periodo_inicio=start_date,
            periodo_fim=end_date,
            nota_final=Decimal('8.50')
        )
        
        self.assertEqual(evaluation.nota_final, Decimal('8.50'))
    
    def test_evaluation_status_workflow(self):
        """Test evaluation status workflow"""
        evaluation = Evaluation.objects.create(
            template=self.template,
            avaliado=self.evaluated,
            avaliador=self.evaluator,
            periodo_inicio=date.today() - timedelta(days=30),
            periodo_fim=date.today()
        )
        
        # Initial status is draft
        self.assertEqual(evaluation.status, 'rascunho')
        
        # Change status through workflow
        evaluation.status = 'em_andamento'
        evaluation.save()
        self.assertEqual(evaluation.status, 'em_andamento')
        
        evaluation.status = 'concluida'
        evaluation.save()
        self.assertEqual(evaluation.status, 'concluida')
