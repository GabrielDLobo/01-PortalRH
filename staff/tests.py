from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import Department, Employee

User = get_user_model()


class EmployeeModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="staffmodel@test.com",
            email="staffmodel@test.com",
            password="testpass123",
            role="funcionario",
        )

    def _build_employee(self, **overrides):
        defaults = dict(
            user=self.user,
            nome="Maria Souza",
            cargo="Analista",
            setor="TI",
            data_admissao=date(2020, 1, 10),
            salario="4500.00",
            cpf="12345678901",
            rg="987654321",
            telefone="11999999999",
            endereco="Rua Teste, 100",
            data_nascimento=date(1990, 5, 20),
        )
        defaults.update(overrides)
        return Employee.objects.create(**defaults)

    def test_is_active_property(self):
        employee = self._build_employee()
        self.assertTrue(employee.is_active)

    def test_string_representation(self):
        employee = self._build_employee()
        self.assertEqual(str(employee), "Maria Souza - Analista")


class DepartmentModelTestCase(TestCase):
    def test_employee_count(self):
        department = Department.objects.create(nome="TI")
        user = User.objects.create_user(
            username="deptmodel@test.com",
            email="deptmodel@test.com",
            password="testpass123",
            role="funcionario",
        )
        Employee.objects.create(
            user=user,
            nome="João Dept",
            cargo="Dev",
            setor="TI",
            data_admissao=date(2021, 1, 1),
            salario="4000.00",
            cpf="11122233344",
            rg="555666777",
            telefone="11988887777",
            endereco="Rua X, 1",
            data_nascimento=date(1992, 3, 3),
        )
        self.assertEqual(department.employee_count, 1)


class EmployeeAPIPermissionTestCase(TestCase):
    """Authorization tests for the staff app's employee endpoint.

    EmployeeViewSet gates every action behind IsStaffOrAdminRH, which
    requires is_admin_rh, so regular employees cannot reach it at all
    -- not even for their own record.
    """

    def setUp(self):
        self.client = APIClient()
        self.hr_user = User.objects.create_user(
            username="staffhr@test.com",
            email="staffhr@test.com",
            password="testpass123",
            role="admin_rh",
        )
        self.employee_user = User.objects.create_user(
            username="staffemployee@test.com",
            email="staffemployee@test.com",
            password="testpass123",
            role="funcionario",
        )
        self.list_url = reverse("employee-list")

    def test_list_requires_authentication(self):
        response = self.client.get(self.list_url, secure=True)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_regular_employee_cannot_list_employees(self):
        self.client.force_authenticate(user=self.employee_user)
        response = self.client.get(self.list_url, secure=True)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_hr_can_list_employees(self):
        self.client.force_authenticate(user=self.hr_user)
        response = self.client.get(self.list_url, secure=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_regular_employee_cannot_access_stats(self):
        self.client.force_authenticate(user=self.employee_user)
        response = self.client.get(reverse("employee-stats"), secure=True)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
