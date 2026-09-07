from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class UserModelTestCase(TestCase):
    """Test cases for User model"""

    def test_user_creation(self):
        """Test basic user creation"""
        user = User.objects.create_user(
            username="testuser", email="test@test.com", password="testpass123", role="funcionario"
        )

        self.assertEqual(user.username, "testuser")
        self.assertEqual(user.email, "test@test.com")
        self.assertEqual(user.role, "funcionario")
        self.assertTrue(user.check_password("testpass123"))

    def test_user_email_uniqueness(self):
        """Test user email uniqueness"""
        User.objects.create_user(username="user1", email="same@test.com", password="testpass123")

        with self.assertRaises(Exception):  # IntegrityError
            User.objects.create_user(
                username="user2", email="same@test.com", password="testpass123"
            )

    def test_user_username_uniqueness(self):
        """Test user username uniqueness"""
        User.objects.create_user(
            username="sameuser", email="email1@test.com", password="testpass123"
        )

        with self.assertRaises(Exception):  # IntegrityError
            User.objects.create_user(
                username="sameuser", email="email2@test.com", password="testpass123"
            )

    def test_superuser_creation(self):
        """Test superuser creation"""
        admin = User.objects.create_superuser(
            username="admin", email="admin@test.com", password="adminpass123"
        )

        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_user_role_choices(self):
        """Test user role choices"""
        roles = ["funcionario", "gerente", "rh", "admin"]

        for role in roles:
            user = User.objects.create_user(
                username=f"user_{role}", email=f"{role}@test.com", password="testpass123", role=role
            )
            self.assertEqual(user.role, role)


class LoginThrottleTestCase(TestCase):
    """Test cases for rate limiting on the login endpoint"""

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        User.objects.create_user(
            username="throttle@test.com",
            email="throttle@test.com",
            password="testpass123",
            role="funcionario",
        )

    def test_login_is_throttled_after_configured_rate(self):
        """The 'login' throttle scope is configured for 5 requests per minute"""
        url = reverse("token_obtain_pair")
        payload = {"email": "throttle@test.com", "password": "wrong-password"}

        # secure=True avoids SecurityMiddleware's SSL redirect, which applies
        # whenever DEBUG=False (see SECURE_SSL_REDIRECT in settings.py).
        responses = [self.client.post(url, payload, secure=True) for _ in range(6)]

        for response in responses[:5]:
            self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(responses[5].status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class UserViewSetAuthorizationTestCase(TestCase):
    """Authorization tests for the user management endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.hr_user = User.objects.create_user(
            username="userhr@test.com",
            email="userhr@test.com",
            password="testpass123",
            role="admin_rh",
        )
        self.employee_a = User.objects.create_user(
            username="usera@test.com",
            email="usera@test.com",
            password="testpass123",
            role="funcionario",
        )
        self.employee_b = User.objects.create_user(
            username="userb@test.com",
            email="userb@test.com",
            password="testpass123",
            role="funcionario",
        )
        self.list_url = reverse("user-list")

    def test_list_requires_authentication(self):
        response = self.client.get(self.list_url, secure=True)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_regular_user_cannot_list_users(self):
        self.client.force_authenticate(user=self.employee_a)
        response = self.client.get(self.list_url, secure=True)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_cannot_retrieve_another_users_detail(self):
        self.client.force_authenticate(user=self.employee_a)
        url = reverse("user-detail", args=[self.employee_b.id])
        response = self.client.get(url, secure=True)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_can_retrieve_own_detail(self):
        self.client.force_authenticate(user=self.employee_a)
        url = reverse("user-detail", args=[self.employee_a.id])
        response = self.client.get(url, secure=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_regular_user_cannot_access_stats(self):
        self.client.force_authenticate(user=self.employee_a)
        response = self.client.get(reverse("user-stats"), secure=True)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class UserRoleEscalationTestCase(TestCase):
    """
    QA_REPORT.md 2026-09-07: um funcionario conseguia se auto-promover a
    admin_rh via PATCH /users/{own_id}/ com {"role": "admin_rh"} -- o
    serializer aceitava "role" como campo gravável e a permissão do endpoint
    (CanUpdateOwnProfile | IsAdminRH) deixa qualquer um editar o próprio
    registro. Corrigido em UserUpdateSerializer.validate_role().
    """

    def setUp(self):
        self.client = APIClient()
        self.hr_user = User.objects.create_user(
            username="rolehr@test.com",
            email="rolehr@test.com",
            password="testpass123",
            role="admin_rh",
        )
        self.employee = User.objects.create_user(
            username="roleemp@test.com",
            email="roleemp@test.com",
            password="testpass123",
            role="funcionario",
        )

    def test_funcionario_cannot_self_promote_to_admin_rh(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse("user-detail", args=[self.employee.id])
        response = self.client.patch(url, {"role": "admin_rh"}, secure=True)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.employee.refresh_from_db()
        self.assertEqual(self.employee.role, "funcionario")

    def test_funcionario_can_still_edit_own_name(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse("user-detail", args=[self.employee.id])
        response = self.client.patch(url, {"first_name": "Novo Nome"}, secure=True)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.employee.refresh_from_db()
        self.assertEqual(self.employee.first_name, "Novo Nome")
        self.assertEqual(self.employee.role, "funcionario")

    def test_admin_rh_can_change_another_users_role(self):
        self.client.force_authenticate(user=self.hr_user)
        url = reverse("user-detail", args=[self.employee.id])
        response = self.client.patch(url, {"role": "admin_rh"}, secure=True)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.employee.refresh_from_db()
        self.assertEqual(self.employee.role, "admin_rh")

    def test_admin_rh_patching_own_role_to_same_value_is_a_noop(self):
        # Reenviar o valor atual (comum em PATCHes parciais) não deve falhar.
        self.client.force_authenticate(user=self.hr_user)
        url = reverse("user-detail", args=[self.hr_user.id])
        response = self.client.patch(url, {"role": "admin_rh"}, secure=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class JWTAuthTestCase(TestCase):
    """401 sem token e com token adulterado."""

    def setUp(self):
        self.client = APIClient()
        User.objects.create_user(
            username="jwtuser@test.com",
            email="jwtuser@test.com",
            password="testpass123",
            role="funcionario",
        )

    def test_no_token_returns_401(self):
        response = self.client.get(reverse("user-profile"), secure=True)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_tampered_token_returns_401(self):
        login = self.client.post(
            reverse("token_obtain_pair"),
            {"email": "jwtuser@test.com", "password": "testpass123"},
            secure=True,
        )
        access = login.data["access"]
        tampered = access[:-1] + ("A" if access[-1] != "A" else "B")

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tampered}")
        response = self.client.get(reverse("user-profile"), secure=True)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_malformed_token_returns_401(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer not-a-real-jwt")
        response = self.client.get(reverse("user-profile"), secure=True)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
