from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from .models import ReportExecution, ReportSchedule, ReportTemplate

User = get_user_model()


class ReportTemplateModelTestCase(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username="owner@test.com",
            email="owner@test.com",
            password="testpass123",
            role="funcionario",
        )
        self.other_user = User.objects.create_user(
            username="other@test.com",
            email="other@test.com",
            password="testpass123",
            role="funcionario",
        )

    def _build_template(self, **overrides):
        defaults = dict(
            name="Relatório de Teste",
            report_type=ReportTemplate.ReportTypeChoices.EMPLOYEES,
            created_by=self.owner,
        )
        defaults.update(overrides)
        return ReportTemplate.objects.create(**defaults)

    def test_public_template_is_accessible_to_anyone(self):
        template = self._build_template(is_public=True)
        self.assertTrue(template.can_access(self.other_user))

    def test_creator_can_access_own_private_template(self):
        template = self._build_template(is_public=False)
        self.assertTrue(template.can_access(self.owner))

    def test_other_user_cannot_access_private_template(self):
        template = self._build_template(is_public=False)
        self.assertFalse(template.can_access(self.other_user))

    def test_allowed_user_can_access_private_template(self):
        template = self._build_template(is_public=False)
        template.allowed_users.add(self.other_user)
        self.assertTrue(template.can_access(self.other_user))


class ReportExecutionModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="exec@test.com",
            email="exec@test.com",
            password="testpass123",
            role="funcionario",
        )
        self.template = ReportTemplate.objects.create(
            name="Template Execução",
            report_type=ReportTemplate.ReportTypeChoices.EMPLOYEES,
            created_by=self.user,
        )

    def test_complete_execution_sets_status_and_result(self):
        execution = ReportExecution.objects.create(
            template=self.template, executed_by=self.user, output_format="json"
        )
        execution.start_execution()
        execution.complete_execution(result_data={"total": 1}, rows_processed=1)

        self.assertEqual(execution.status, ReportExecution.StatusChoices.COMPLETED)
        self.assertEqual(execution.result_data, {"total": 1})
        self.assertIsNotNone(execution.execution_time_seconds)

    def test_fail_execution_sets_error_message(self):
        execution = ReportExecution.objects.create(
            template=self.template, executed_by=self.user, output_format="json"
        )
        execution.fail_execution("boom")

        self.assertEqual(execution.status, ReportExecution.StatusChoices.FAILED)
        self.assertEqual(execution.error_message, "boom")

    def test_is_expired(self):
        execution = ReportExecution.objects.create(
            template=self.template,
            executed_by=self.user,
            output_format="json",
            expires_at=timezone.now() - timezone.timedelta(days=1),
        )
        self.assertTrue(execution.is_expired)


class ReportScheduleModelTestCase(TestCase):
    def test_success_rate_calculation(self):
        user = User.objects.create_user(
            username="sched@test.com",
            email="sched@test.com",
            password="testpass123",
            role="funcionario",
        )
        template = ReportTemplate.objects.create(
            name="Template Agendado",
            report_type=ReportTemplate.ReportTypeChoices.EMPLOYEES,
            created_by=user,
        )
        schedule = ReportSchedule.objects.create(
            name="Agendamento Semanal",
            template=template,
            frequency=ReportSchedule.FrequencyChoices.WEEKLY,
            output_format="json",
            created_by=user,
        )
        schedule.record_execution(success=True)
        schedule.record_execution(success=False)

        self.assertEqual(schedule.execution_count, 2)
        self.assertEqual(schedule.success_rate, 50.0)


class ReportTemplateAPIPermissionTestCase(TestCase):
    """Authorization tests for the report templates endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username="apiowner@test.com",
            email="apiowner@test.com",
            password="testpass123",
            role="funcionario",
        )
        self.other_user = User.objects.create_user(
            username="apiother@test.com",
            email="apiother@test.com",
            password="testpass123",
            role="funcionario",
        )
        self.private_template = ReportTemplate.objects.create(
            name="Relatório Privado",
            report_type=ReportTemplate.ReportTypeChoices.EMPLOYEES,
            created_by=self.owner,
            is_public=False,
        )
        self.list_url = reverse("reports:reporttemplate-list")
        self.detail_url = reverse("reports:reporttemplate-detail", args=[self.private_template.id])

    def test_list_requires_authentication(self):
        response = self.client.get(self.list_url, secure=True)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_cannot_see_other_users_private_template_in_list(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(self.list_url, secure=True)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = [str(item["id"]) for item in response.data["results"]]
        self.assertNotIn(str(self.private_template.id), returned_ids)

    def test_user_cannot_retrieve_other_users_private_template(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(self.detail_url, secure=True)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_owner_can_retrieve_own_private_template(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.get(self.detail_url, secure=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
