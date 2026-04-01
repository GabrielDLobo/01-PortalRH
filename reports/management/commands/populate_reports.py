from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from reports.models import ReportCategory, ReportTemplate

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with default report categories and templates'

    def handle(self, *args, **options):
        self.stdout.write('Populating report categories and templates...')

        # Create categories
        categories_data = [
            {
                'name': 'Recursos Humanos',
                'description': 'Relatórios relacionados a gestão de pessoas',
                'icon': 'people',
                'color': '#007bff'
            },
            {
                'name': 'Admissões',
                'description': 'Relatórios sobre processos de admissão',
                'icon': 'person_add',
                'color': '#28a745'
            },
            {
                'name': 'Desligamentos',
                'description': 'Relatórios sobre processos de desligamento',
                'icon': 'person_remove',
                'color': '#dc3545'
            },
            {
                'name': 'Avaliações',
                'description': 'Relatórios de performance e avaliações',
                'icon': 'star',
                'color': '#ffc107'
            },
            {
                'name': 'Férias e Licenças',
                'description': 'Relatórios sobre solicitações de férias e licenças',
                'icon': 'event',
                'color': '#17a2b8'
            },
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = ReportCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(f'Created category: {category.name}')
            else:
                self.stdout.write(f'Category already exists: {category.name}')

        # Get or create admin user for templates
        try:
            admin_user = User.objects.filter(role='admin').first()
            if not admin_user:
                admin_user = User.objects.filter(is_superuser=True).first()

            if not admin_user:
                self.stdout.write(self.style.WARNING('No admin user found. Templates will be created without creator.'))
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error finding admin user: {e}'))
            return

        # Create default report templates
        templates_data = [
            {
                'name': 'Relatório Completo de Funcionários',
                'description': 'Relatório detalhado com todos os dados dos funcionários ativos',
                'report_type': 'employees',
                'category': categories['Recursos Humanos'],
                'query_config': {
                    'default_filters': {
                        'status': 'active'
                    },
                    'default_ordering': 'hire_date'
                },
                'output_formats': ['json', 'pdf', 'excel', 'csv'],
                'default_format': 'excel',
                'columns_config': {
                    'visible_columns': [
                        'employee_id', 'full_name', 'email', 'department',
                        'position', 'hire_date', 'salary', 'status'
                    ],
                    'column_labels': {
                        'employee_id': 'ID do Funcionário',
                        'full_name': 'Nome Completo',
                        'email': 'E-mail',
                        'department': 'Departamento',
                        'position': 'Cargo',
                        'hire_date': 'Data de Admissão',
                        'salary': 'Salário',
                        'status': 'Status'
                    }
                },
                'is_public': True,
                'allowed_roles': ['admin', 'rh'],
                'cache_duration': 600
            },
            {
                'name': 'Dashboard de Admissões',
                'description': 'Resumo dos processos de admissão em andamento',
                'report_type': 'admissions',
                'category': categories['Admissões'],
                'query_config': {
                    'default_filters': {},
                    'default_ordering': '-hire_date'
                },
                'output_formats': ['json', 'pdf', 'excel'],
                'default_format': 'json',
                'chart_config': {
                    'charts': [
                        {
                            'type': 'pie',
                            'title': 'Status dos Processos',
                            'data_field': 'admission_status'
                        },
                        {
                            'type': 'bar',
                            'title': 'Admissões por Mês',
                            'data_field': 'hire_date'
                        }
                    ]
                },
                'is_public': False,
                'allowed_roles': ['admin', 'rh'],
                'cache_duration': 300
            },
            {
                'name': 'Relatório de Desligamentos',
                'description': 'Relatório detalhado de todos os desligamentos',
                'report_type': 'terminations',
                'category': categories['Desligamentos'],
                'query_config': {
                    'default_filters': {},
                    'default_ordering': '-created_at'
                },
                'output_formats': ['json', 'pdf', 'excel', 'csv'],
                'default_format': 'pdf',
                'columns_config': {
                    'visible_columns': [
                        'employee_name', 'reason', 'termination_date',
                        'status', 'requester'
                    ]
                },
                'is_public': False,
                'allowed_roles': ['admin', 'rh'],
                'cache_duration': 600
            },
            {
                'name': 'Relatório de Avaliações de Performance',
                'description': 'Relatório com todas as avaliações de performance realizadas',
                'report_type': 'evaluations',
                'category': categories['Avaliações'],
                'query_config': {
                    'default_filters': {},
                    'default_ordering': '-evaluation_date'
                },
                'output_formats': ['json', 'pdf', 'excel'],
                'default_format': 'excel',
                'columns_config': {
                    'visible_columns': [
                        'employee_name', 'evaluator_name', 'evaluation_date',
                        'overall_score', 'status'
                    ]
                },
                'chart_config': {
                    'charts': [
                        {
                            'type': 'histogram',
                            'title': 'Distribuição de Notas',
                            'data_field': 'overall_score'
                        }
                    ]
                },
                'is_public': False,
                'allowed_roles': ['admin', 'rh', 'gestor'],
                'cache_duration': 900
            },
            {
                'name': 'Relatório de Solicitações de Férias',
                'description': 'Relatório de todas as solicitações de férias e licenças',
                'report_type': 'leave_requests',
                'category': categories['Férias e Licenças'],
                'query_config': {
                    'default_filters': {},
                    'default_ordering': '-created_at'
                },
                'output_formats': ['json', 'pdf', 'excel', 'csv'],
                'default_format': 'excel',
                'columns_config': {
                    'visible_columns': [
                        'employee_name', 'leave_type', 'start_date',
                        'end_date', 'days_requested', 'status'
                    ]
                },
                'chart_config': {
                    'charts': [
                        {
                            'type': 'bar',
                            'title': 'Solicitações por Status',
                            'data_field': 'status'
                        },
                        {
                            'type': 'line',
                            'title': 'Solicitações por Mês',
                            'data_field': 'start_date'
                        }
                    ]
                },
                'is_public': False,
                'allowed_roles': ['admin', 'rh', 'gestor'],
                'cache_duration': 300
            },
            {
                'name': 'Dashboard Executivo',
                'description': 'Dashboard resumo para gestores com principais métricas',
                'report_type': 'dashboard',
                'category': categories['Recursos Humanos'],
                'query_config': {
                    'summary_only': True
                },
                'output_formats': ['json', 'pdf'],
                'default_format': 'json',
                'chart_config': {
                    'charts': [
                        {
                            'type': 'pie',
                            'title': 'Funcionários por Departamento',
                            'data_field': 'department'
                        },
                        {
                            'type': 'line',
                            'title': 'Contratações vs Desligamentos',
                            'data_field': 'monthly_data'
                        }
                    ]
                },
                'is_public': False,
                'allowed_roles': ['admin', 'rh', 'gestor'],
                'cache_duration': 300
            }
        ]

        for template_data in templates_data:
            template, created = ReportTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults={
                    **template_data,
                    'created_by': admin_user
                }
            )
            if created:
                self.stdout.write(f'Created template: {template.name}')
            else:
                self.stdout.write(f'Template already exists: {template.name}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully populated {len(categories_data)} categories and {len(templates_data)} templates'
            )
        )