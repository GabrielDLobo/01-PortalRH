from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class UserModelTestCase(TestCase):
    """Test cases for User model"""
    
    def test_user_creation(self):
        """Test basic user creation"""
        user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            role='funcionario'
        )
        
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@test.com')
        self.assertEqual(user.role, 'funcionario')
        self.assertTrue(user.check_password('testpass123'))
    
    def test_user_email_uniqueness(self):
        """Test user email uniqueness"""
        User.objects.create_user(
            username='user1',
            email='same@test.com',
            password='testpass123'
        )
        
        with self.assertRaises(Exception):  # IntegrityError
            User.objects.create_user(
                username='user2',
                email='same@test.com',
                password='testpass123'
            )
    
    def test_user_username_uniqueness(self):
        """Test user username uniqueness"""
        User.objects.create_user(
            username='sameuser',
            email='email1@test.com',
            password='testpass123'
        )
        
        with self.assertRaises(Exception):  # IntegrityError
            User.objects.create_user(
                username='sameuser',
                email='email2@test.com',
                password='testpass123'
            )
    
    def test_superuser_creation(self):
        """Test superuser creation"""
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='adminpass123'
        )
        
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
    
    def test_user_role_choices(self):
        """Test user role choices"""
        roles = ['funcionario', 'gerente', 'rh', 'admin']
        
        for role in roles:
            user = User.objects.create_user(
                username=f'user_{role}',
                email=f'{role}@test.com',
                password='testpass123',
                role=role
            )
            self.assertEqual(user.role, role)
