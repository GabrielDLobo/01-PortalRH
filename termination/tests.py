from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import TerminationReason, TerminationRequest

User = get_user_model()


class TerminationReasonModelTestCase(TestCase):
    def test_string_representation(self):
        reason = TerminationReason.objects.create(nome='Pedido de Demissão', codigo='PD')
        self.assertEqual(str(reason), 'PD - Pedido de Demissão')


class TerminationRequestModelTestCase(TestCase):
    def setUp(self):
        self.manager = User.objects.create_user(
            username='manager@test.com', email='manager@test.com',
            password='testpass123', role='admin_rh'
        )
        self.employee = User.objects.create_user(
            username='employee@test.com', email='employee@test.com',
            password='testpass123', role='funcionario'
        )
        self.reason = TerminationReason.objects.create(nome='Justa Causa', codigo='JC')

    def _build_request(self, **overrides):
        defaults = dict(
            funcionario=self.employee,
            solicitante=self.manager,
            motivo=self.reason,
            data_ultimo_dia=date.today() + timedelta(days=10),
            data_desligamento=date.today() + timedelta(days=15),
            justificativa='Justificativa detalhada de teste.',
        )
        defaults.update(overrides)
        return TerminationRequest.objects.create(**defaults)

    def test_defaults_to_draft_status(self):
        request = self._build_request()
        self.assertTrue(request.is_draft)
        self.assertTrue(request.can_be_edited)

    def test_clean_rejects_termination_date_before_last_work_day(self):
        request = self._build_request(
            data_ultimo_dia=date.today() + timedelta(days=15),
            data_desligamento=date.today() + timedelta(days=10),
        )
        with self.assertRaises(ValidationError):
            request.clean()

    def test_submit_for_approval_transitions_to_pending(self):
        request = self._build_request()
        request.submit_for_approval()
        self.assertTrue(request.is_pending_hr)
        self.assertFalse(request.can_be_edited)

    def test_approve_by_hr_sets_approver_and_status(self):
        request = self._build_request(status=TerminationRequest.StatusChoices.PENDENTE_RH)
        request.approve_by_hr(self.manager, comentario='Aprovado.')

        self.assertTrue(request.is_approved)
        self.assertEqual(request.aprovador_rh, self.manager)
        self.assertEqual(request.comentario_aprovacao_rh, 'Aprovado.')

    def test_reject_by_hr_sets_status(self):
        request = self._build_request(status=TerminationRequest.StatusChoices.PENDENTE_RH)
        request.reject_by_hr(self.manager, comentario='Faltou documentação.')

        self.assertEqual(request.status, TerminationRequest.StatusChoices.REJEITADA_RH)
        self.assertTrue(request.can_be_edited)


class TerminationRequestAPITestCase(TestCase):
    """Authorization tests for the termination requests endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.hr_user = User.objects.create_user(
            username='hr@test.com', email='hr@test.com',
            password='testpass123', role='admin_rh'
        )
        self.employee_user = User.objects.create_user(
            username='funcionario@test.com', email='funcionario@test.com',
            password='testpass123', role='funcionario'
        )
        self.reason = TerminationReason.objects.create(nome='Pedido de Demissão', codigo='PD')
        self.list_url = reverse('termination:termination-request-list')

    def _payload(self):
        return {
            'funcionario': self.employee_user.id,
            'motivo': self.reason.id,
            'data_ultimo_dia': str(date.today() + timedelta(days=10)),
            'data_desligamento': str(date.today() + timedelta(days=15)),
            'justificativa': 'Justificativa detalhada de teste com mais de vinte caracteres.',
        }

    def test_list_requires_authentication(self):
        response = self.client.get(self.list_url, secure=True)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_employee_cannot_create_termination_request(self):
        self.client.force_authenticate(user=self.employee_user)
        response = self.client.post(self.list_url, self._payload(), secure=True)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_hr_can_create_termination_request(self):
        self.client.force_authenticate(user=self.hr_user)
        response = self.client.post(self.list_url, self._payload(), secure=True)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_employee_cannot_approve_termination_request(self):
        termination_request = TerminationRequest.objects.create(
            funcionario=self.employee_user,
            solicitante=self.hr_user,
            motivo=self.reason,
            data_ultimo_dia=date.today() + timedelta(days=10),
            data_desligamento=date.today() + timedelta(days=15),
            justificativa='Justificativa detalhada de teste.',
            status=TerminationRequest.StatusChoices.PENDENTE_RH,
        )
        self.client.force_authenticate(user=self.employee_user)
        url = reverse('termination:termination-request-approve', args=[termination_request.pk])

        response = self.client.post(url, {'comentario': 'ok'}, secure=True)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
