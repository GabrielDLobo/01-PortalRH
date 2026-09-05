"""
Management command: seed_demo

Popula o banco com dados fictícios em pt-BR para a demo pública do PortalRH.
Sem dependências externas (não usa Faker) — pronto para rodar no servidor e ser
chamado pelo endpoint de reset agendado.

Uso:
    python manage.py seed_demo                # limpa dados de demo e recria
    python manage.py seed_demo --employees 24 # define o tamanho do quadro
    python manage.py seed_demo --keep         # não limpa antes (aditivo)

Contas de acesso criadas (login é por e-mail):
    RH  (admin):      rh.demo@portalrh.com.br   / demo1234
    Funcionário:      demo@portalrh.com.br      / demo1234

IMPORTANTE: use este comando apenas em ambiente de demonstração. Ele apaga
usuários não-superusuário e os dados transacionais para recriar um estado limpo.
"""

from __future__ import annotations

import random
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

User = get_user_model()

# Senha padrão da demo (espelha o padrão do SGE). Trocas de senha na demo devem
# ser bloqueadas pelo "demo guard" (ver Fase 1). Aqui garantimos um estado inicial.
DEMO_PASSWORD = "demo1234"
DEMO_EMAIL_DOMAIN = "portalrh.demo"  # e-mails gerados; facilita a limpeza

# ---------------------------------------------------------------------------
# Pools de dados fictícios (pt-BR)
# ---------------------------------------------------------------------------
PRIMEIROS_NOMES = [
    "Ana", "Bruno", "Carla", "Diego", "Eduarda", "Felipe", "Gabriela", "Henrique",
    "Isabela", "João", "Larissa", "Marcelo", "Natália", "Otávio", "Patrícia",
    "Rafael", "Sofia", "Thiago", "Vanessa", "William", "Beatriz", "Caio",
    "Daniela", "Emerson", "Fernanda", "Gustavo", "Helena", "Igor", "Juliana",
    "Leonardo", "Mariana", "Nícolas", "Priscila", "Ricardo", "Renata", "Vinícius",
]
SOBRENOMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves",
    "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho",
    "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha",
    "Dias", "Nunes", "Moreira", "Cardoso", "Teixeira", "Correia", "Mendes",
]
SETORES = [
    "Tecnologia", "Financeiro", "Comercial", "Recursos Humanos", "Marketing",
    "Operações", "Jurídico", "Atendimento", "Logística", "Produto",
]
CARGOS_POR_SETOR = {
    "Tecnologia": ["Desenvolvedor(a) Backend", "Desenvolvedor(a) Frontend", "Analista de QA", "DevOps", "Tech Lead"],
    "Financeiro": ["Analista Financeiro", "Contas a Pagar", "Contas a Receber", "Controller", "Auxiliar Financeiro"],
    "Comercial": ["Executivo(a) de Vendas", "SDR", "Gerente Comercial", "Analista Comercial"],
    "Recursos Humanos": ["Analista de RH", "Business Partner", "Recrutador(a)", "Analista de DP"],
    "Marketing": ["Analista de Marketing", "Designer", "Social Media", "Growth"],
    "Operações": ["Analista de Operações", "Coordenador(a) de Operações", "Assistente Operacional"],
    "Jurídico": ["Advogado(a)", "Analista Jurídico", "Paralegal"],
    "Atendimento": ["Analista de Suporte", "Customer Success", "Atendente"],
    "Logística": ["Analista de Logística", "Assistente de Logística", "Coordenador(a) de Logística"],
    "Produto": ["Product Manager", "Product Designer", "Analista de Produto"],
}
CIDADES_UF = [
    ("São Paulo", "SP"), ("Campinas", "SP"), ("Rio de Janeiro", "RJ"),
    ("Belo Horizonte", "MG"), ("Curitiba", "PR"), ("Porto Alegre", "RS"),
    ("Salvador", "BA"), ("Recife", "PE"), ("Fortaleza", "CE"), ("Goiânia", "GO"),
]
LOGRADOUROS = [
    "Rua das Acácias", "Avenida Paulista", "Rua Sete de Setembro", "Alameda Santos",
    "Rua XV de Novembro", "Avenida Brasil", "Rua da Consolação", "Travessa das Flores",
]
BANCOS = [
    ("Banco do Brasil", "001"), ("Itaú", "341"), ("Bradesco", "237"),
    ("Santander", "033"), ("Caixa", "104"), ("Nubank", "260"),
]
MOTIVOS_FERIAS = [
    "Descanso anual programado", "Viagem em família", "Recesso de fim de ano",
    "Assuntos pessoais", "Período de férias regulamentar",
]
MOTIVOS_LICENCA = [
    "Consulta e acompanhamento médico", "Recuperação após procedimento",
    "Assunto familiar", "Compromisso pessoal inadiável",
]
ESTADOS_CIVIS = ["single", "married", "divorced", "widowed", "stable_union"]
ESCOLARIDADES = ["high_school", "technical", "undergraduate", "postgraduate"]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _cpf_digits(seed_index: int) -> str:
    """Gera um CPF de 11 dígitos com dígitos verificadores válidos e único por índice."""
    base = [(seed_index * 7 + i * 3 + random.randint(0, 9)) % 10 for i in range(9)]
    # primeiro dígito verificador
    s = sum((10 - i) * base[i] for i in range(9))
    d1 = (s * 10 % 11) % 10
    base.append(d1)
    # segundo dígito verificador
    s = sum((11 - i) * base[i] for i in range(10))
    d2 = (s * 10 % 11) % 10
    base.append(d2)
    return "".join(str(d) for d in base)


def _fmt_cpf(cpf11: str) -> str:
    return f"{cpf11[:3]}.{cpf11[3:6]}.{cpf11[6:9]}-{cpf11[9:]}"


def _telefone() -> str:
    ddd = random.choice([11, 11, 11, 21, 31, 41, 51, 61, 71, 85])
    return f"({ddd}) 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"


def _rg() -> str:
    return f"{random.randint(10, 59)}.{random.randint(100, 999)}.{random.randint(100, 999)}-{random.randint(0, 9)}"


def _data_passada(min_dias: int, max_dias: int) -> date:
    return date.today() - timedelta(days=random.randint(min_dias, max_dias))


def _data_futura(min_dias: int, max_dias: int) -> date:
    return date.today() + timedelta(days=random.randint(min_dias, max_dias))


class Command(BaseCommand):
    help = "Popula o banco com dados fictícios em pt-BR para a demo do PortalRH."

    def add_arguments(self, parser):
        parser.add_argument("--employees", type=int, default=16, help="Quantidade de funcionários fictícios (além das contas demo).")
        parser.add_argument("--keep", action="store_true", help="Não limpar os dados existentes antes de semear.")
        parser.add_argument("--password", type=str, default=DEMO_PASSWORD, help="Senha das contas demo.")

    def handle(self, *args, **options):
        qtd = max(4, options["employees"])
        senha = options["password"]

        self.stdout.write(self.style.MIGRATE_HEADING("Semeando dados de demonstração do PortalRH..."))

        with transaction.atomic():
            if not options["keep"]:
                self._wipe()
            self._ensure_reference_data()
            rh_user, demo_user = self._create_demo_accounts(senha)
            funcionarios = self._create_employees(qtd)
            todos = funcionarios + [demo_user]  # rh_user é gestor/aprovador
            self._create_leave_requests(todos, rh_user)
            self._create_evaluations(todos, rh_user)
            self._create_evaluation_cycle(todos, rh_user)
            self._create_terminations(funcionarios, rh_user)
            self._create_report_templates(rh_user)

        self._print_summary(senha, qtd)

    # ------------------------------------------------------------------ wipe
    def _wipe(self):
        self.stdout.write("  Limpando dados anteriores da demo...")
        from evaluations.models import (
            Evaluation, EvaluationCycle, EvaluationCycleParticipant, EvaluationScore,
        )
        from leave_requests.models import LeaveBalance, LeaveRequest
        from reports.models import ReportExecution, ReportTemplate
        from termination.models import TerminationDocument, TerminationRequest

        import staff.models as staff_models
        import employees.models as employees_models

        EvaluationScore.objects.all().delete()
        Evaluation.objects.all().delete()
        EvaluationCycleParticipant.objects.all().delete()
        EvaluationCycle.objects.all().delete()
        LeaveRequest.objects.all().delete()
        LeaveBalance.objects.all().delete()
        TerminationDocument.objects.all().delete()
        TerminationRequest.objects.all().delete()
        ReportExecution.objects.all().delete()
        ReportTemplate.objects.all().delete()

        # Perfis de funcionário (dois modelos distintos)
        staff_models.EmployeeDocument.objects.all().delete()
        staff_models.Employee.objects.all().delete()
        employees_models.EmployeeDocument.objects.all().delete()
        employees_models.Employee.objects.all().delete()

        # Usuários que não são superusuário (mantém o admin do Django)
        User.objects.filter(is_superuser=False).delete()

    # -------------------------------------------------------- reference data
    def _ensure_reference_data(self):
        """Cria dados de base idempotentes (compatível com setup_initial_data)."""
        from leave_requests.models import LeaveType
        from termination.models import TerminationReason
        from evaluations.models import EvaluationCriteria, EvaluationTemplate
        from reports.models import ReportCategory
        import staff.models as staff_models

        # Tipos de afastamento
        tipos = [
            ("Férias", "Férias anuais regulares", 30, 30),
            ("Licença Médica", "Afastamento por motivos de saúde", 15, 1),
            ("Licença Maternidade", "Licença maternidade/paternidade", 120, 30),
            ("Falta Justificada", "Falta por motivos justificados", 5, 1),
            ("Licença sem Vencimentos", "Licença sem remuneração", 90, 30),
        ]
        for nome, desc, maxd, ant in tipos:
            LeaveType.objects.get_or_create(
                nome=nome,
                defaults={"descricao": desc, "max_dias_ano": maxd, "antecedencia_minima": ant, "requer_aprovacao": True},
            )

        # Departamentos (espelham os setores)
        for setor in SETORES:
            staff_models.Department.objects.get_or_create(nome=setor, defaults={"descricao": f"Departamento de {setor}"})

        # Template de avaliação + critérios (se ainda não existir)
        template, created = EvaluationTemplate.objects.get_or_create(
            nome="Avaliação de Performance Anual",
            defaults={"descricao": "Template padrão para avaliação anual de performance", "ativo": True},
        )
        if created:
            criterios = [
                ("Qualidade do Trabalho", Decimal("2.0"), 1),
                ("Produtividade", Decimal("2.0"), 2),
                ("Conhecimento Técnico", Decimal("1.5"), 3),
                ("Comunicação", Decimal("1.5"), 4),
                ("Trabalho em Equipe", Decimal("1.0"), 5),
                ("Iniciativa", Decimal("1.0"), 6),
            ]
            for nome, peso, ordem in criterios:
                EvaluationCriteria.objects.create(template=template, nome=nome, peso=peso, ordem=ordem)

        # Motivos de desligamento
        motivos = [
            ("Pedido de Demissão", "PD"),
            ("Sem Justa Causa", "SJC"),
            ("Com Justa Causa", "CJC"),
            ("Fim de Contrato", "FC"),
            ("Acordo Mútuo", "AM"),
        ]
        for nome, codigo in motivos:
            TerminationReason.objects.get_or_create(codigo=codigo, defaults={"nome": nome, "ativo": True})

        # Categorias de relatório
        for nome, cor in [("Pessoas", "#22D3EE"), ("Movimentações", "#7C6FF0"), ("Desempenho", "#10B981")]:
            ReportCategory.objects.get_or_create(name=nome, defaults={"color": cor})

    # ----------------------------------------------------------- demo accounts
    def _create_demo_accounts(self, senha: str):
        self.stdout.write("  Criando contas de acesso da demo...")
        rh_user = self._make_user("RH", "Demonstração", f"rh.demo@portalrh.com.br", "admin_rh", senha)
        demo_user = self._make_user("Colaborador", "Demonstração", f"demo@portalrh.com.br", "funcionario", senha)

        # Perfis para as duas contas
        self._make_staff_profile(rh_user, "Recursos Humanos", "Business Partner", 0)
        self._make_employees_profile(rh_user, "Recursos Humanos", "Business Partner", 0)
        self._make_staff_profile(demo_user, "Comercial", "Executivo(a) de Vendas", 1)
        self._make_employees_profile(demo_user, "Comercial", "Executivo(a) de Vendas", 1)
        return rh_user, demo_user

    def _make_user(self, first: str, last: str, email: str, role: str, senha: str) -> "User":
        user = User.objects.create_user(
            username=email, email=email, password=senha,
            first_name=first, last_name=last, role=role,
        )
        return user

    # ------------------------------------------------------------- employees
    def _create_employees(self, qtd: int):
        self.stdout.write(f"  Criando {qtd} funcionários fictícios...")
        funcionarios = []
        usados = set()
        for i in range(qtd):
            first = random.choice(PRIMEIROS_NOMES)
            last = f"{random.choice(SOBRENOMES)} {random.choice(SOBRENOMES)}"
            # e-mail único
            base = f"{first}.{last.split()[0]}".lower().replace(" ", "")
            email = f"{base}.{i}@{DEMO_EMAIL_DOMAIN}"
            while email in usados:
                email = f"{base}.{i}{random.randint(1,99)}@{DEMO_EMAIL_DOMAIN}"
            usados.add(email)

            user = self._make_user(first, last, email, "funcionario", DEMO_PASSWORD)
            setor = random.choice(SETORES)
            cargo = random.choice(CARGOS_POR_SETOR[setor])
            self._make_staff_profile(user, setor, cargo, i + 10)
            self._make_employees_profile(user, setor, cargo, i + 10)
            funcionarios.append(user)
        return funcionarios

    def _make_staff_profile(self, user, setor, cargo, idx):
        import staff.models as staff_models
        status = random.choices(
            [staff_models.Employee.StatusChoices.ATIVO,
             staff_models.Employee.StatusChoices.FERIAS,
             staff_models.Employee.StatusChoices.AFASTADO],
            weights=[80, 12, 8],
        )[0]
        cidade, uf = random.choice(CIDADES_UF)
        return staff_models.Employee.objects.create(
            user=user,
            nome=user.get_full_name(),
            cargo=cargo,
            setor=setor,
            data_admissao=_data_passada(120, 3200),
            salario=Decimal(random.randrange(2200, 22000, 100)),
            cpf=_cpf_digits(idx),
            rg=_rg(),
            telefone=_telefone(),
            endereco=f"{random.choice(LOGRADOUROS)}, {random.randint(10, 1999)} - {cidade}/{uf}",
            data_nascimento=_data_passada(365 * 22, 365 * 55),
            status=status,
            observacoes="",
        )

    def _make_employees_profile(self, user, setor, cargo, idx):
        import employees.models as employees_models
        cidade, uf = random.choice(CIDADES_UF)
        banco, codigo = random.choice(BANCOS)
        return employees_models.Employee.objects.create(
            user=user,
            full_name=user.get_full_name(),
            cpf=_fmt_cpf(_cpf_digits(idx + 5000)),
            rg=_rg(),
            birth_date=_data_passada(365 * 22, 365 * 55),
            marital_status=random.choice(ESTADOS_CIVIS),
            phone=_telefone(),
            email=user.email,
            street_address=random.choice(LOGRADOUROS),
            address_number=str(random.randint(10, 1999)),
            neighborhood="Centro",
            city=cidade,
            state=uf,
            zip_code=f"{random.randint(10000, 99999)}-{random.randint(100, 999)}",
            education_level=random.choice(ESCOLARIDADES),
            bank_name=banco,
            bank_code=codigo,
            agency_number=str(random.randint(1000, 9999)),
            account_number=f"{random.randint(10000, 99999)}-{random.randint(0, 9)}",
            department=setor,
            position=cargo,
            hire_date=_data_passada(120, 3200),
            salary=Decimal(random.randrange(2200, 22000, 100)),
            status="active",
            admission_completed=True,
            requires_password_change=False,
        )

    # ------------------------------------------------------------ leave reqs
    def _create_leave_requests(self, usuarios, rh_user):
        self.stdout.write("  Criando solicitações de afastamento...")
        from leave_requests.models import LeaveBalance, LeaveRequest, LeaveType

        tipos = list(LeaveType.objects.all())
        ferias = next((t for t in tipos if "rias" in t.nome.lower()), None)
        outros = [t for t in tipos if t is not ferias]
        ano = date.today().year

        for user in usuarios:
            # Saldo de férias do ano corrente
            if ferias:
                usados = random.choice([0, 0, 5, 10])
                LeaveBalance.objects.get_or_create(
                    funcionario=user, tipo=ferias, ano=ano,
                    defaults={"dias_disponiveis": 30, "dias_utilizados": usados},
                )
            # 0 a 2 solicitações por pessoa
            for _ in range(random.randint(0, 2)):
                aprovada = random.random() < 0.55
                if aprovada:
                    tipo = random.choice(tipos)
                    inicio = _data_passada(30, 300)
                    status = LeaveRequest.StatusChoices.APROVADA
                else:
                    tipo = random.choice(tipos)
                    inicio = _data_futura(max(tipo.antecedencia_minima, 5), 120)
                    status = random.choice([
                        LeaveRequest.StatusChoices.PENDENTE,
                        LeaveRequest.StatusChoices.PENDENTE,
                        LeaveRequest.StatusChoices.REJEITADA,
                    ])

                is_ferias = "rias" in tipo.nome.lower()
                dias = random.choice([5, 10, 15, 20, 30]) if is_ferias else random.choice([1, 2, 3, 5])
                fim = inicio + timedelta(days=dias - 1)
                motivo = random.choice(MOTIVOS_FERIAS if is_ferias else MOTIVOS_LICENCA)

                req = LeaveRequest(
                    solicitante=user, tipo=tipo, data_inicio=inicio, data_fim=fim,
                    motivo=motivo, status=status,
                    prioridade=random.choice(list(LeaveRequest.PriorityChoices.values)),
                    dias_gozo=dias if is_ferias else None,
                )
                if status == LeaveRequest.StatusChoices.APROVADA:
                    req.aprovador = rh_user
                    req.data_aprovacao = timezone.now() - timedelta(days=random.randint(5, 60))
                    req.comentario_aprovacao = "Aprovado conforme política interna."
                elif status == LeaveRequest.StatusChoices.REJEITADA:
                    req.aprovador = rh_user
                    req.data_aprovacao = timezone.now() - timedelta(days=random.randint(1, 20))
                    req.comentario_aprovacao = "Período indisponível para a equipe no momento."
                req.save()

    # ------------------------------------------------------------ evaluations
    def _create_evaluations(self, usuarios, rh_user):
        self.stdout.write("  Criando avaliações...")
        from evaluations.models import Evaluation, EvaluationCriteria, EvaluationScore, EvaluationTemplate

        template = EvaluationTemplate.objects.filter(ativo=True).first()
        if not template:
            return
        criterios = list(EvaluationCriteria.objects.filter(template=template))

        for user in usuarios:
            if random.random() < 0.6:
                concluida = random.random() < 0.6
                inicio = _data_passada(300, 400)
                fim = inicio + timedelta(days=180)
                ev = Evaluation.objects.create(
                    template=template, avaliado=user, avaliador=rh_user,
                    tipo=Evaluation.TypeChoices.AVALIACAO_SUPERIOR,
                    periodo_inicio=inicio, periodo_fim=fim,
                    status=(Evaluation.StatusChoices.CONCLUIDA if concluida else Evaluation.StatusChoices.EM_ANDAMENTO),
                    comentario_geral="Bom desempenho no período, com evolução consistente.",
                    pontos_fortes="Comprometimento, colaboração e domínio técnico.",
                    pontos_melhoria="Aprofundar gestão de tempo em projetos paralelos.",
                    metas_objetivos="Assumir liderança técnica em uma iniciativa no próximo ciclo.",
                )
                if concluida and criterios:
                    for crit in criterios:
                        EvaluationScore.objects.create(
                            avaliacao=ev, criterio=crit,
                            nota=Decimal(str(round(random.uniform(6.0, 9.8), 2))),
                            comentario="",
                        )
                    ev.nota_final = ev.calculate_final_score()
                    ev.data_conclusao = timezone.now() - timedelta(days=random.randint(5, 90))
                    ev.save(update_fields=["nota_final", "data_conclusao"])

    def _create_evaluation_cycle(self, usuarios, rh_user):
        from evaluations.models import EvaluationCycle, EvaluationCycleParticipant, EvaluationTemplate
        template = EvaluationTemplate.objects.filter(ativo=True).first()
        if not template:
            return
        ciclo = EvaluationCycle.objects.create(
            nome=f"Ciclo de Avaliação {date.today().year}",
            descricao="Ciclo anual de avaliação de desempenho.",
            data_inicio=date(date.today().year, 1, 1),
            data_fim=date(date.today().year, 12, 31),
            template=template,
            status=EvaluationCycle.StatusChoices.ATIVO,
            created_by=rh_user,
        )
        for user in usuarios:
            EvaluationCycleParticipant.objects.get_or_create(
                cycle=ciclo, funcionario=user,
                defaults={"avaliador": rh_user, "data_limite": timezone.now() + timedelta(days=60)},
            )

    # ---------------------------------------------------------- terminations
    def _create_terminations(self, funcionarios, rh_user):
        self.stdout.write("  Criando solicitações de desligamento...")
        from termination.models import TerminationReason, TerminationRequest
        motivos = list(TerminationReason.objects.all())
        if not motivos or len(funcionarios) < 3:
            return
        amostra = random.sample(funcionarios, k=min(3, len(funcionarios)))
        status_pool = [
            TerminationRequest.StatusChoices.PENDENTE_RH,
            TerminationRequest.StatusChoices.APROVADA_RH,
            TerminationRequest.StatusChoices.CONCLUIDA,
        ]
        for i, user in enumerate(amostra):
            ultimo = _data_futura(5, 40) if i == 0 else _data_passada(10, 120)
            desligamento = ultimo + timedelta(days=random.randint(0, 10))
            status = status_pool[i % len(status_pool)]
            req = TerminationRequest(
                funcionario=user, solicitante=rh_user, motivo=random.choice(motivos),
                data_ultimo_dia=ultimo, data_desligamento=desligamento,
                justificativa="Processo de desligamento conforme alinhamento com a liderança e o RH.",
                status=status,
            )
            if status in (TerminationRequest.StatusChoices.APROVADA_RH, TerminationRequest.StatusChoices.CONCLUIDA):
                req.aprovador_rh = rh_user
                req.data_aprovacao_rh = timezone.now() - timedelta(days=random.randint(1, 30))
                req.comentario_aprovacao_rh = "Aprovado pelo RH."
            req.save()

    # -------------------------------------------------------- report templates
    def _create_report_templates(self, rh_user):
        self.stdout.write("  Criando templates de relatório...")
        from reports.models import ReportCategory, ReportTemplate

        cat_pessoas = ReportCategory.objects.filter(name="Pessoas").first()
        cat_mov = ReportCategory.objects.filter(name="Movimentações").first()
        cat_desemp = ReportCategory.objects.filter(name="Desempenho").first()

        templates = [
            ("Quadro de Funcionários", ReportTemplate.ReportTypeChoices.EMPLOYEES, cat_pessoas),
            ("Solicitações de Férias", ReportTemplate.ReportTypeChoices.LEAVE_REQUESTS, cat_mov),
            ("Desligamentos do Período", ReportTemplate.ReportTypeChoices.TERMINATIONS, cat_mov),
            ("Resultados de Avaliações", ReportTemplate.ReportTypeChoices.EVALUATIONS, cat_desemp),
        ]
        for nome, rtype, cat in templates:
            ReportTemplate.objects.create(
                name=nome, report_type=rtype, category=cat,
                description=f"Relatório de {nome.lower()} gerado a partir dos dados do sistema.",
                output_formats=["pdf", "excel", "csv"],
                default_format=ReportTemplate.OutputFormatChoices.PDF,
                allowed_roles=["admin_rh"],
                created_by=rh_user,
                is_active=True,
            )

    # ------------------------------------------------------------- summary
    def _print_summary(self, senha: str, qtd: int):
        from leave_requests.models import LeaveRequest
        from evaluations.models import Evaluation
        from termination.models import TerminationRequest
        import staff.models as staff_models

        self.stdout.write(self.style.SUCCESS("\nDemo semeada com sucesso!"))
        self.stdout.write(
            f"  Funcionários: {staff_models.Employee.objects.count()} | "
            f"Afastamentos: {LeaveRequest.objects.count()} | "
            f"Avaliações: {Evaluation.objects.count()} | "
            f"Desligamentos: {TerminationRequest.objects.count()}"
        )
        self.stdout.write(self.style.WARNING("\n  Acesso à demo (login por e-mail):"))
        self.stdout.write(f"    RH (admin):    rh.demo@portalrh.com.br   / {senha}")
        self.stdout.write(f"    Funcionário:   demo@portalrh.com.br      / {senha}")
