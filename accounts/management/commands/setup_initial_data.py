from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from datetime import date, timedelta
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Setup initial data for PortalRH'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-superuser',
            action='store_true',
            help='Create a superuser account',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Setting up initial data for PortalRH...')
        )

        with transaction.atomic():
            self.create_users(options['create_superuser'])
            self.create_leave_types()
            self.create_evaluation_templates()

        self.stdout.write(
            self.style.SUCCESS('Initial data setup completed successfully!')
        )

    def create_users(self, create_superuser):
        """Create initial users"""
        self.stdout.write('Creating users...')

        # Create superuser if requested
        if create_superuser and not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@portalrh.com',
                password='admin123',
                first_name='Admin',
                last_name='PortalRH',
                role='admin_rh'
            )
            self.stdout.write('  - Superuser created: admin@portalrh.com / admin123')

        # Create HR Admin
        if not User.objects.filter(email='rh@portalrh.com').exists():
            User.objects.create_user(
                username='rh_admin',
                email='rh@portalrh.com',
                password='rh123',
                first_name='RH',
                last_name='Administrator',
                role='admin_rh'
            )
            self.stdout.write('  - RH Admin created: rh@portalrh.com / rh123')


        # Create Employee
        if not User.objects.filter(email='funcionario@portalrh.com').exists():
            User.objects.create_user(
                username='funcionario',
                email='funcionario@portalrh.com',
                password='func123',
                first_name='Maria',
                last_name='Santos',
                role='funcionario'
            )
            self.stdout.write('  - Employee created: funcionario@portalrh.com / func123')

    def create_leave_types(self):
        """Create initial leave types"""
        self.stdout.write('Creating leave types...')
        
        from leave_requests.models import LeaveType

        leave_types = [
            {
                'nome': 'Férias',
                'descricao': 'Férias anuais regulares',
                'max_dias_ano': 30,
                'antecedencia_minima': 30,
                'requer_aprovacao': True
            },
            {
                'nome': 'Licença Médica',
                'descricao': 'Afastamento por motivos de saúde',
                'max_dias_ano': 15,
                'antecedencia_minima': 1,
                'requer_aprovacao': True
            },
            {
                'nome': 'Licença Maternidade',
                'descricao': 'Licença maternidade/paternidade',
                'max_dias_ano': 120,
                'antecedencia_minima': 30,
                'requer_aprovacao': True
            },
            {
                'nome': 'Falta Justificada',
                'descricao': 'Falta por motivos justificados',
                'max_dias_ano': 5,
                'antecedencia_minima': 1,
                'requer_aprovacao': True
            },
            {
                'nome': 'Licença sem Vencimentos',
                'descricao': 'Licença sem remuneração',
                'max_dias_ano': 90,
                'antecedencia_minima': 30,
                'requer_aprovacao': True
            }
        ]

        for leave_type_data in leave_types:
            leave_type, created = LeaveType.objects.get_or_create(
                nome=leave_type_data['nome'],
                defaults=leave_type_data
            )
            if created:
                self.stdout.write(f'  - Leave type created: {leave_type.nome}')

    def create_evaluation_templates(self):
        """Create initial evaluation templates"""
        self.stdout.write('Creating evaluation templates...')
        
        from evaluations.models import EvaluationTemplate, EvaluationCriteria

        # Performance Evaluation Template
        template, created = EvaluationTemplate.objects.get_or_create(
            nome='Avaliação de Performance Anual',
            defaults={
                'descricao': 'Template padrão para avaliação anual de performance',
                'ativo': True
            }
        )

        if created:
            self.stdout.write(f'  - Template created: {template.nome}')
            
            # Create criteria for the template
            criteria_list = [
                {
                    'nome': 'Qualidade do Trabalho',
                    'descricao': 'Avaliação da qualidade e precisão do trabalho executado',
                    'peso': Decimal('2.0'),
                    'ordem': 1
                },
                {
                    'nome': 'Produtividade',
                    'descricao': 'Capacidade de entregar resultados no prazo',
                    'peso': Decimal('2.0'),
                    'ordem': 2
                },
                {
                    'nome': 'Conhecimento Técnico',
                    'descricao': 'Domínio das competências técnicas necessárias',
                    'peso': Decimal('1.5'),
                    'ordem': 3
                },
                {
                    'nome': 'Comunicação',
                    'descricao': 'Habilidade de comunicação verbal e escrita',
                    'peso': Decimal('1.5'),
                    'ordem': 4
                },
                {
                    'nome': 'Trabalho em Equipe',
                    'descricao': 'Capacidade de colaborar efetivamente',
                    'peso': Decimal('1.0'),
                    'ordem': 5
                },
                {
                    'nome': 'Iniciativa',
                    'descricao': 'Proatividade e autonomia na resolução de problemas',
                    'peso': Decimal('1.0'),
                    'ordem': 6
                },
                {
                    'nome': 'Pontualidade e Assiduidade',
                    'descricao': 'Cumprimento de horários e frequência',
                    'peso': Decimal('1.0'),
                    'ordem': 7
                }
            ]

            for criteria_data in criteria_list:
                criteria_data['template'] = template
                EvaluationCriteria.objects.create(**criteria_data)
                self.stdout.write(f'    - Criteria created: {criteria_data["nome"]}')

        # 360 Degree Evaluation Template
        template_360, created = EvaluationTemplate.objects.get_or_create(
            nome='Avaliação 360 Graus',
            defaults={
                'descricao': 'Template para avaliação 360 graus com múltiplas perspectivas',
                'ativo': True
            }
        )

        if created:
            self.stdout.write(f'  - Template created: {template_360.nome}')
            
            criteria_360_list = [
                {
                    'nome': 'Liderança',
                    'descricao': 'Capacidade de liderar e influenciar positivamente',
                    'peso': Decimal('2.0'),
                    'ordem': 1
                },
                {
                    'nome': 'Relacionamento Interpessoal',
                    'descricao': 'Qualidade dos relacionamentos com colegas',
                    'peso': Decimal('2.0'),
                    'ordem': 2
                },
                {
                    'nome': 'Comunicação Efetiva',
                    'descricao': 'Clareza e efetividade na comunicação',
                    'peso': Decimal('1.5'),
                    'ordem': 3
                },
                {
                    'nome': 'Adaptabilidade',
                    'descricao': 'Flexibilidade e adaptação a mudanças',
                    'peso': Decimal('1.5'),
                    'ordem': 4
                },
                {
                    'nome': 'Resolução de Conflitos',
                    'descricao': 'Habilidade para mediar e resolver conflitos',
                    'peso': Decimal('1.0'),
                    'ordem': 5
                }
            ]

            for criteria_data in criteria_360_list:
                criteria_data['template'] = template_360
                EvaluationCriteria.objects.create(**criteria_data)
                self.stdout.write(f'    - Criteria created: {criteria_data["nome"]}')

        self.stdout.write('Initial data setup completed!')