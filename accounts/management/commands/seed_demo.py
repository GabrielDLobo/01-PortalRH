"""
Management command: seed_demo

Popula o banco com dados fictícios em pt-BR para a demo pública do PortalRH,
coerentes com a CLT (férias, admissões e desligamentos). Sem dependências
externas (não usa Faker) — pronto para rodar no servidor e ser chamado pelo
endpoint de reset agendado.

Uso:
    python manage.py seed_demo                # limpa dados de demo e recria
    python manage.py seed_demo --employees 24 # define o tamanho do quadro
    python manage.py seed_demo --keep         # não limpa antes (aditivo)

Contas de acesso criadas (login é por e-mail):
    RH  (admin):      rh.demo@portalrh.com.br   / demo1234
    Funcionário:      demo@portalrh.com.br      / demo1234

Notas de CLT aplicadas aos dados fictícios:
    - Férias: 30 dias por período aquisitivo (após 12 meses), fracionáveis em até
      3 períodos sendo um >= 14 dias; abono pecuniário de até 10 dias (venda de 1/3),
      total <= 30; aviso de 30 dias de antecedência nas solicitações futuras.
    - Admissões: contrato CLT/experiência, jornada 44h, salário acima do mínimo,
      benefícios (VT, VR, plano de saúde).
    - Desligamentos: verbas coerentes com o motivo (sem justa causa, pedido,
      justa causa, acordo mútuo art. 484-A, fim de contrato).

IMPORTANTE: use apenas em ambiente de demonstração. Ele apaga usuários
não-superusuário e os dados transacionais para recriar um estado limpo.
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

DEMO_PASSWORD = "demo1234"
DEMO_EMAIL_DOMAIN = "portalrh.demo"
CANDIDATO_EMAIL_DOMAIN = "candidato.portalrh.demo"
SALARIO_MINIMO = Decimal("1518.00")  # referência; salários fictícios ficam acima

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
FAIXA_SALARIAL = {  # (min, max) em R$, todos acima do mínimo
    "Tecnologia": (4500, 18000), "Financeiro": (3000, 14000), "Comercial": (2500, 16000),
    "Recursos Humanos": (3000, 12000), "Marketing": (2800, 11000), "Operações": (2200, 9000),
    "Jurídico": (4000, 16000), "Atendimento": (2000, 6500), "Logística": (2000, 7500),
    "Produto": (5000, 17000),
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
BANCOS = [("Banco do Brasil", "001"), ("Itaú", "341"), ("Bradesco", "237"),
          ("Santander", "033"), ("Caixa", "104"), ("Nubank", "260")]
GESTORES = ["Cláudia Meireles", "Roberto Assunção", "Fernanda Prado", "Marcos Tavares", "Luciana Bastos"]
BENEFICIOS = [
    "Vale-transporte, vale-refeição (R$ 35/dia), plano de saúde e odontológico.",
    "Vale-refeição (R$ 40/dia), vale-alimentação (R$ 600/mês), plano de saúde.",
    "Vale-transporte, plano de saúde, gympass e day off no aniversário.",
]
ESTADOS_CIVIS = ["single", "married", "divorced", "widowed", "stable_union"]
ESCOLARIDADES = ["high_school", "technical", "undergraduate", "postgraduate"]
MOTIVOS_LICENCA = [
    "Consulta e acompanhamento médico.", "Recuperação após procedimento.",
    "Assunto familiar.", "Compromisso pessoal inadiável.",
]

# Verbas rescisórias por código de motivo (resumo didático, coerente com a CLT)
RESCISAO = {
    "SJC": ("Desligamento sem justa causa por reestruturação de equipe.",
            "Aviso prévio indenizado (30 dias + 3 por ano trabalhado, limitado a 90), "
            "saldo de salário, férias vencidas e proporcionais + 1/3, 13º proporcional, "
            "multa de 40% sobre o FGTS e liberação das guias de saque do FGTS e seguro-desemprego."),
    "PD":  ("Colaborador solicitou o desligamento por proposta em outra empresa.",
            "Saldo de salário, férias vencidas e proporcionais + 1/3 e 13º proporcional. "
            "Sem multa do FGTS e sem seguro-desemprego; aviso prévio trabalhado ou descontado."),
    "CJC": ("Descumprimento reiterado de normas internas após advertências formais.",
            "Apenas saldo de salário e férias vencidas + 1/3. Sem aviso prévio, sem multa do FGTS, "
            "sem 13º proporcional e sem seguro-desemprego."),
    "AM":  ("Rescisão por acordo entre as partes (art. 484-A da CLT).",
            "Aviso prévio indenizado pela metade (50%), multa de 20% sobre o FGTS e saque de até 80% do saldo. "
            "Demais verbas integrais; sem direito a seguro-desemprego."),
    "FC":  ("Encerramento de contrato por prazo determinado (experiência).",
            "Saldo de salário, férias proporcionais + 1/3 e 13º proporcional, conforme o período trabalhado."),
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _cpf_digits(seed_index: int) -> str:
    base = [(seed_index * 7 + i * 3 + random.randint(0, 9)) % 10 for i in range(9)]
    s = sum((10 - i) * base[i] for i in range(9)); base.append((s * 10 % 11) % 10)
    s = sum((11 - i) * base[i] for i in range(10)); base.append((s * 10 % 11) % 10)
    return "".join(str(d) for d in base)


def _fmt_cpf(c: str) -> str:
    return f"{c[:3]}.{c[3:6]}.{c[6:9]}-{c[9:]}"


def _telefone() -> str:
    ddd = random.choice([11, 11, 11, 21, 31, 41, 51, 61, 71, 85])
    return f"({ddd}) 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"


def _rg() -> str:
    return f"{random.randint(10, 59)}.{random.randint(100, 999)}.{random.randint(100, 999)}-{random.randint(0, 9)}"


def _salario(setor: str) -> Decimal:
    lo, hi = FAIXA_SALARIAL.get(setor, (2200, 12000))
    val = Decimal(random.randrange(lo, hi, 100))
    return max(val, SALARIO_MINIMO)


def _passada(min_d, max_d): return date.today() - timedelta(days=random.randint(min_d, max_d))
def _futura(min_d, max_d): return date.today() + timedelta(days=random.randint(min_d, max_d))


class Command(BaseCommand):
    help = "Popula o banco com dados fictícios em pt-BR (coerentes com a CLT) para a demo."

    def add_arguments(self, parser):
        parser.add_argument("--employees", type=int, default=16)
        parser.add_argument("--keep", action="store_true")
        parser.add_argument("--password", type=str, default=DEMO_PASSWORD)

    def handle(self, *args, **options):
        qtd = max(4, options["employees"])
        senha = options["password"]
        self.stdout.write(self.style.MIGRATE_HEADING("Semeando dados de demonstração (CLT) do PortalRH..."))

        with transaction.atomic():
            if not options["keep"]:
                self._wipe()
            self._ensure_reference_data()
            rh_user, demo_user, demo_hire = self._create_demo_accounts(senha)
            equipe = self._create_employees(qtd)                    # [(user, hire_date, setor)]
            todos = equipe + [(demo_user, demo_hire, "Comercial")]
            self._create_leave_requests(todos, rh_user)
            self._create_admissions(rh_user)
            self._create_evaluations([u for u, _, _ in todos], rh_user)
            self._create_evaluation_cycle([u for u, _, _ in todos], rh_user)
            self._create_terminations([u for u, _, _ in equipe], rh_user)
            self._create_report_templates(rh_user)

        self._print_summary(senha)

    # ------------------------------------------------------------------ wipe
    def _wipe(self):
        self.stdout.write("  Limpando dados anteriores da demo...")
        from evaluations.models import (Evaluation, EvaluationCycle,
                                         EvaluationCycleParticipant, EvaluationScore)
        from leave_requests.models import LeaveBalance, LeaveRequest
        from reports.models import ReportExecution, ReportTemplate
        from termination.models import TerminationDocument, TerminationRequest
        import staff.models as staff_models
        import employees.models as emp_models

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
        # Admissões antes dos usuários (PreAdmissionRH.created_by é PROTECT)
        emp_models.PreAdmissionRH.objects.all().delete()
        emp_models.AdmissionProcess.objects.all().delete()
        emp_models.EmployeeDocument.objects.all().delete()
        emp_models.Employee.objects.all().delete()
        staff_models.EmployeeDocument.objects.all().delete()
        staff_models.Employee.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

    # -------------------------------------------------------- reference data
    def _ensure_reference_data(self):
        from leave_requests.models import LeaveType
        from termination.models import TerminationReason
        from evaluations.models import EvaluationCriteria, EvaluationTemplate
        from reports.models import ReportCategory
        import staff.models as staff_models

        for nome, desc, maxd, ant in [
            ("Férias", "Férias anuais regulares (CLT)", 30, 30),
            ("Licença Médica", "Afastamento por motivos de saúde", 15, 1),
            ("Licença Maternidade", "Licença maternidade/paternidade", 120, 30),
            ("Falta Justificada", "Falta por motivos justificados", 5, 1),
            ("Licença sem Vencimentos", "Licença sem remuneração", 90, 30),
        ]:
            LeaveType.objects.get_or_create(nome=nome, defaults={
                "descricao": desc, "max_dias_ano": maxd, "antecedencia_minima": ant, "requer_aprovacao": True})

        for setor in SETORES:
            staff_models.Department.objects.get_or_create(nome=setor, defaults={"descricao": f"Departamento de {setor}"})

        template, created = EvaluationTemplate.objects.get_or_create(
            nome="Avaliação de Performance Anual",
            defaults={"descricao": "Template padrão para avaliação anual de performance", "ativo": True})
        if created:
            for nome, peso, ordem in [
                ("Qualidade do Trabalho", Decimal("2.0"), 1), ("Produtividade", Decimal("2.0"), 2),
                ("Conhecimento Técnico", Decimal("1.5"), 3), ("Comunicação", Decimal("1.5"), 4),
                ("Trabalho em Equipe", Decimal("1.0"), 5), ("Iniciativa", Decimal("1.0"), 6)]:
                EvaluationCriteria.objects.create(template=template, nome=nome, peso=peso, ordem=ordem)

        for nome, codigo in [("Pedido de Demissão", "PD"), ("Sem Justa Causa", "SJC"),
                             ("Com Justa Causa", "CJC"), ("Fim de Contrato", "FC"), ("Acordo Mútuo", "AM")]:
            TerminationReason.objects.get_or_create(codigo=codigo, defaults={"nome": nome, "ativo": True})

        for nome, cor in [("Pessoas", "#22D3EE"), ("Movimentações", "#7C6FF0"), ("Desempenho", "#10B981")]:
            ReportCategory.objects.get_or_create(name=nome, defaults={"color": cor})

    # ----------------------------------------------------------- demo accounts
    def _create_demo_accounts(self, senha):
        self.stdout.write("  Criando contas de acesso da demo...")
        rh = self._make_user("RH", "Demonstração", "rh.demo@portalrh.com.br", "admin_rh", senha)
        demo = self._make_user("Colaborador", "Demonstração", "demo@portalrh.com.br", "funcionario", senha)
        rh_hire = _passada(700, 1500)
        demo_hire = _passada(500, 1200)
        self._make_staff_profile(rh, "Recursos Humanos", "Business Partner", 0, rh_hire)
        self._make_employees_profile(rh, "Recursos Humanos", "Business Partner", 0, rh_hire)
        self._make_staff_profile(demo, "Comercial", "Executivo(a) de Vendas", 1, demo_hire)
        self._make_employees_profile(demo, "Comercial", "Executivo(a) de Vendas", 1, demo_hire)
        return rh, demo, demo_hire

    def _make_user(self, first, last, email, role, senha):
        return User.objects.create_user(username=email, email=email, password=senha,
                                        first_name=first, last_name=last, role=role)

    # ------------------------------------------------------------- employees
    def _create_employees(self, qtd):
        self.stdout.write(f"  Criando {qtd} funcionários fictícios...")
        equipe, usados = [], set()
        for i in range(qtd):
            first = random.choice(PRIMEIROS_NOMES)
            last = f"{random.choice(SOBRENOMES)} {random.choice(SOBRENOMES)}"
            base = f"{first}.{last.split()[0]}".lower()
            email = f"{base}.{i}@{DEMO_EMAIL_DOMAIN}"
            while email in usados:
                email = f"{base}.{i}{random.randint(1, 99)}@{DEMO_EMAIL_DOMAIN}"
            usados.add(email)
            user = self._make_user(first, last, email, "funcionario", DEMO_PASSWORD)
            setor = random.choice(SETORES)
            cargo = random.choice(CARGOS_POR_SETOR[setor])
            hire = _passada(120, 3200)
            self._make_staff_profile(user, setor, cargo, i + 10, hire)
            self._make_employees_profile(user, setor, cargo, i + 10, hire)
            equipe.append((user, hire, setor))
        return equipe

    def _make_staff_profile(self, user, setor, cargo, idx, hire):
        import staff.models as staff_models
        status = random.choices(
            [staff_models.Employee.StatusChoices.ATIVO, staff_models.Employee.StatusChoices.FERIAS,
             staff_models.Employee.StatusChoices.AFASTADO], weights=[82, 11, 7])[0]
        cidade, uf = random.choice(CIDADES_UF)
        return staff_models.Employee.objects.create(
            user=user, nome=user.get_full_name(), cargo=cargo, setor=setor,
            data_admissao=hire, salario=_salario(setor), cpf=_cpf_digits(idx), rg=_rg(),
            telefone=_telefone(),
            endereco=f"{random.choice(LOGRADOUROS)}, {random.randint(10, 1999)} - {cidade}/{uf}",
            data_nascimento=_passada(365 * 22, 365 * 55), status=status)

    def _make_employees_profile(self, user, setor, cargo, idx, hire):
        import employees.models as emp_models
        cidade, uf = random.choice(CIDADES_UF)
        banco, codigo = random.choice(BANCOS)
        return emp_models.Employee.objects.create(
            user=user, full_name=user.get_full_name(), cpf=_fmt_cpf(_cpf_digits(idx + 5000)), rg=_rg(),
            birth_date=_passada(365 * 22, 365 * 55), marital_status=random.choice(ESTADOS_CIVIS),
            phone=_telefone(), email=user.email, street_address=random.choice(LOGRADOUROS),
            address_number=str(random.randint(10, 1999)), neighborhood="Centro", city=cidade, state=uf,
            zip_code=f"{random.randint(10000, 99999)}-{random.randint(100, 999)}",
            education_level=random.choice(ESCOLARIDADES), bank_name=banco, bank_code=codigo,
            agency_number=str(random.randint(1000, 9999)),
            account_number=f"{random.randint(10000, 99999)}-{random.randint(0, 9)}",
            department=setor, position=cargo, hire_date=hire, salary=_salario(setor),
            status="active", admission_completed=True, requires_password_change=False)

    # ------------------------------------------------------- leave (CLT) ----
    def _create_leave_requests(self, equipe, rh_user):
        self.stdout.write("  Criando férias e afastamentos (regras CLT)...")
        from leave_requests.models import LeaveBalance, LeaveRequest, LeaveType

        tipos = list(LeaveType.objects.all())
        ferias_tipo = next((t for t in tipos if "rias" in t.nome.lower()), None)
        outros = [t for t in tipos if t is not ferias_tipo]
        ano = date.today().year
        # padrões válidos de período de férias: (dias_gozo, dias_abono) com soma <= 30 e um período >= 14
        padroes_ferias = [(30, 0), (20, 10), (15, 0), (14, 0), (22, 8), (15, 10)]

        for user, hire, _ in equipe:
            elegivel_ferias = (date.today() - hire).days >= 365  # período aquisitivo completo
            if ferias_tipo and elegivel_ferias:
                LeaveBalance.objects.get_or_create(
                    funcionario=user, tipo=ferias_tipo, ano=ano,
                    defaults={"dias_disponiveis": 30, "dias_utilizados": random.choice([0, 0, 10, 15])})

            for _ in range(random.randint(0, 2)):
                usa_ferias = elegivel_ferias and ferias_tipo and random.random() < 0.5
                if usa_ferias:
                    gozo, abono = random.choice(padroes_ferias)
                    futura = random.random() < 0.5
                    if futura:
                        inicio = _futura(35, 150)  # aviso >= 30 dias
                        status = random.choice([LeaveRequest.StatusChoices.PENDENTE,
                                                LeaveRequest.StatusChoices.PENDENTE,
                                                LeaveRequest.StatusChoices.APROVADA])
                    else:
                        inicio = _passada(30, 320)
                        status = LeaveRequest.StatusChoices.APROVADA
                    req = LeaveRequest(
                        solicitante=user, tipo=ferias_tipo, data_inicio=inicio,
                        data_fim=inicio + timedelta(days=gozo - 1), dias_gozo=gozo,
                        tem_abono_pecuniario=abono > 0, dias_abono_pecuniario=(abono or None),
                        motivo="Gozo de férias referente ao período aquisitivo.", status=status,
                        prioridade=LeaveRequest.PriorityChoices.MEDIA)
                else:
                    tipo = random.choice(outros) if outros else ferias_tipo
                    dias = random.choice([1, 2, 3, 5])
                    aprovada = random.random() < 0.55
                    inicio = _passada(20, 200) if aprovada else _futura(3, 60)
                    status = (LeaveRequest.StatusChoices.APROVADA if aprovada else
                              random.choice([LeaveRequest.StatusChoices.PENDENTE,
                                             LeaveRequest.StatusChoices.REJEITADA]))
                    req = LeaveRequest(
                        solicitante=user, tipo=tipo, data_inicio=inicio,
                        data_fim=inicio + timedelta(days=dias - 1),
                        motivo=random.choice(MOTIVOS_LICENCA), status=status,
                        prioridade=random.choice(list(LeaveRequest.PriorityChoices.values)))

                if req.status == LeaveRequest.StatusChoices.APROVADA:
                    req.aprovador = rh_user
                    req.data_aprovacao = timezone.now() - timedelta(days=random.randint(3, 60))
                    req.comentario_aprovacao = "Aprovado conforme política interna e escala da equipe."
                elif req.status == LeaveRequest.StatusChoices.REJEITADA:
                    req.aprovador = rh_user
                    req.data_aprovacao = timezone.now() - timedelta(days=random.randint(1, 20))
                    req.comentario_aprovacao = "Período com baixa cobertura na equipe; sugerida nova data."
                req.save()

    # --------------------------------------------------- admissões (CLT) ----
    def _create_admissions(self, rh_user):
        self.stdout.write("  Criando pipeline de admissões (contratos CLT)...")
        from employees.models import PreAdmissionRH
        contratos = ["clt", "clt", "clt", "internship", "pj"]
        estagios = [(False, False), (True, False), (True, True)]  # (usuário criado, e-mail enviado)
        for i in range(5):
            first = random.choice(PRIMEIROS_NOMES)
            last = f"{random.choice(SOBRENOMES)} {random.choice(SOBRENOMES)}"
            setor = random.choice(SETORES)
            cargo = random.choice(CARGOS_POR_SETOR[setor])
            contrato = random.choice(contratos)
            criado, email_ok = random.choice(estagios)
            PreAdmissionRH.objects.create(
                personal_email=f"{first}.{last.split()[0]}.{i}@{CANDIDATO_EMAIL_DOMAIN}".lower(),
                full_name=f"{first} {last}", position=cargo, department=setor,
                job_description=f"Atuar com {cargo.lower()} no time de {setor}, reportando ao gestor da área.",
                work_schedule="08h às 17h, de segunda a sexta (1h de intervalo)",
                weekly_workload="44h" if contrato == "clt" else random.choice(["30h", "20h"]),
                contract_type=contrato, salary=_salario(setor),
                benefits=random.choice(BENEFICIOS),
                start_date=_futura(5, 40),
                vacation_policy="30 dias de férias por período aquisitivo (após 12 meses), "
                                "fracionáveis em até 3 períodos, sendo um de no mínimo 14 dias, conforme CLT.",
                direct_manager=random.choice(GESTORES),
                created_by=rh_user, employee_user_created=criado, email_sent=email_ok,
                temporary_password="" if not criado else "TempSenha123")

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
                inicio = _passada(300, 400)
                ev = Evaluation.objects.create(
                    template=template, avaliado=user, avaliador=rh_user,
                    tipo=Evaluation.TypeChoices.AVALIACAO_SUPERIOR,
                    periodo_inicio=inicio, periodo_fim=inicio + timedelta(days=180),
                    status=(Evaluation.StatusChoices.CONCLUIDA if concluida else Evaluation.StatusChoices.EM_ANDAMENTO),
                    comentario_geral="Bom desempenho no período, com evolução consistente.",
                    pontos_fortes="Comprometimento, colaboração e domínio técnico.",
                    pontos_melhoria="Aprofundar gestão de tempo em projetos paralelos.",
                    metas_objetivos="Assumir liderança técnica em uma iniciativa no próximo ciclo.")
                if concluida and criterios:
                    for crit in criterios:
                        EvaluationScore.objects.create(
                            avaliacao=ev, criterio=crit,
                            nota=Decimal(str(round(random.uniform(6.0, 9.8), 2))))
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
            data_inicio=date(date.today().year, 1, 1), data_fim=date(date.today().year, 12, 31),
            template=template, status=EvaluationCycle.StatusChoices.ATIVO, created_by=rh_user)
        for user in usuarios:
            EvaluationCycleParticipant.objects.get_or_create(
                cycle=ciclo, funcionario=user,
                defaults={"avaliador": rh_user, "data_limite": timezone.now() + timedelta(days=60)})

    # ------------------------------------------------- desligamentos (CLT) --
    def _create_terminations(self, funcionarios, rh_user):
        self.stdout.write("  Criando desligamentos (verbas rescisórias CLT)...")
        from termination.models import TerminationReason, TerminationRequest
        motivos = {m.codigo: m for m in TerminationReason.objects.all()}
        if not motivos or len(funcionarios) < 4:
            return
        amostra = random.sample(funcionarios, k=min(4, len(funcionarios)))
        plano = [
            ("SJC", TerminationRequest.StatusChoices.CONCLUIDA),
            ("PD", TerminationRequest.StatusChoices.CONCLUIDA),
            ("AM", TerminationRequest.StatusChoices.APROVADA_RH),
            ("CJC", TerminationRequest.StatusChoices.PENDENTE_RH),
        ]
        for user, (codigo, status) in zip(amostra, plano):
            motivo = motivos.get(codigo) or random.choice(list(motivos.values()))
            justificativa, verbas = RESCISAO.get(codigo, ("Desligamento.", ""))
            passado = status in (TerminationRequest.StatusChoices.CONCLUIDA,)
            ultimo = _passada(10, 120) if passado else _futura(5, 30)
            req = TerminationRequest(
                funcionario=user, solicitante=rh_user, motivo=motivo,
                data_ultimo_dia=ultimo, data_desligamento=ultimo + timedelta(days=random.randint(0, 10)),
                justificativa=justificativa, observacoes_rh=verbas, status=status)
            if status in (TerminationRequest.StatusChoices.APROVADA_RH, TerminationRequest.StatusChoices.CONCLUIDA):
                req.aprovador_rh = rh_user
                req.data_aprovacao_rh = timezone.now() - timedelta(days=random.randint(1, 30))
                req.comentario_aprovacao_rh = "Verbas conferidas pelo RH conforme a CLT."
            req.save()

    # -------------------------------------------------------- report templates
    def _create_report_templates(self, rh_user):
        self.stdout.write("  Criando templates de relatório...")
        from reports.models import ReportCategory, ReportTemplate
        cats = {c.name: c for c in ReportCategory.objects.all()}
        for nome, rtype, cat in [
            ("Quadro de Funcionários", ReportTemplate.ReportTypeChoices.EMPLOYEES, "Pessoas"),
            ("Solicitações de Férias", ReportTemplate.ReportTypeChoices.LEAVE_REQUESTS, "Movimentações"),
            ("Admissões do Período", ReportTemplate.ReportTypeChoices.ADMISSIONS, "Movimentações"),
            ("Desligamentos do Período", ReportTemplate.ReportTypeChoices.TERMINATIONS, "Movimentações"),
            ("Resultados de Avaliações", ReportTemplate.ReportTypeChoices.EVALUATIONS, "Desempenho")]:
            ReportTemplate.objects.create(
                name=nome, report_type=rtype, category=cats.get(cat),
                description=f"Relatório de {nome.lower()} gerado a partir dos dados do sistema.",
                output_formats=["pdf", "excel", "csv"],
                default_format=ReportTemplate.OutputFormatChoices.PDF,
                allowed_roles=["admin_rh"], created_by=rh_user, is_active=True)

    # ------------------------------------------------------------- summary
    def _print_summary(self, senha):
        from leave_requests.models import LeaveRequest
        from evaluations.models import Evaluation
        from termination.models import TerminationRequest
        from employees.models import PreAdmissionRH
        import staff.models as staff_models
        self.stdout.write(self.style.SUCCESS("\nDemo semeada com sucesso!"))
        self.stdout.write(
            f"  Funcionários: {staff_models.Employee.objects.count()} | "
            f"Férias/afastamentos: {LeaveRequest.objects.count()} | "
            f"Admissões: {PreAdmissionRH.objects.count()} | "
            f"Avaliações: {Evaluation.objects.count()} | "
            f"Desligamentos: {TerminationRequest.objects.count()}")
        self.stdout.write(self.style.WARNING("\n  Acesso à demo (login por e-mail):"))
        self.stdout.write(f"    RH (admin):    rh.demo@portalrh.com.br   / {senha}")
        self.stdout.write(f"    Funcionário:   demo@portalrh.com.br      / {senha}")
