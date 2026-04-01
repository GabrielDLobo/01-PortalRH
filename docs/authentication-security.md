# Authentication & Security

This document details the authentication mechanisms, authorization model, and security measures implemented in PortalRH.

---

## 🔐 Authentication System

### Overview

PortalRH uses **JWT (JSON Web Tokens)** for stateless authentication via the `djangorestframework-simplejwt` package.

### Token Types

| Token Type | Lifetime | Purpose |
|------------|----------|---------|
| **Access Token** | 1 hour | Used for API requests |
| **Refresh Token** | 7 days | Used to obtain new access tokens |

### JWT Configuration

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

---

## 🔑 Authentication Flow

### 1. Login

```http
POST /api/v1/accounts/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin_rh"
  },
  "requires_password_change": false
}
```

### 2. Using Access Token

Include the access token in the Authorization header:

```http
GET /api/v1/employees/employees/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 3. Refreshing Token

When the access token expires:

```http
POST /api/v1/accounts/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 4. Token Verification

To verify if a token is valid:

```http
POST /api/v1/accounts/auth/verify/
Content-Type: application/json

{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

## 👤 User Model

### Custom User Model

PortalRH uses a custom user model extending Django's `AbstractUser`:

```python
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin_rh', 'Admin RH'),
        ('funcionario', 'Funcionário'),
    ]
    
    email = models.EmailField(unique=True, verbose_name='Email')
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='funcionario'
    )
    
    USERNAME_FIELD = 'email'  # Email-based authentication
    REQUIRED_FIELDS = ['first_name', 'last_name']
```

### User Roles

| Role | Permissions |
|------|-------------|
| **admin_rh** | Full system access, user management, all CRUD operations |
| **funcionario** | Limited access to personal data, leave requests, evaluations |

---

## 🔒 Authorization & Permissions

### Permission Classes

PortalRH implements custom permission classes in `app/permissions.py`:

#### IsAdminRH

```python
class IsAdminRH(permissions.BasePermission):
    """Permission class for Admin RH users only."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_rh
```

#### IsOwnerOrAdminRH

```python
class IsOwnerOrAdminRH(permissions.BasePermission):
    """Permission class for owner or Admin RH."""
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_rh:
            return True
        return obj.user == request.user
```

#### CanViewEmployee

```python
class CanViewEmployee(permissions.BasePermission):
    """Permission to view employee data."""
    
    def has_permission(self, request, view):
        if request.user.is_admin_rh:
            return True
        return request.user.is_authenticated
```

#### CanManageEmployee

```python
class CanManageEmployee(permissions.BasePermission):
    """Permission to manage employees (Admin RH only)."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_rh
```

### Permission Usage in Views

```python
class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminRH]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [CanViewEmployee]
        elif self.action == 'my_profile':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
```

---

## 🔐 Password Management

### Password Validators

```python
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
```

### Password Hashing

Django's built-in password hashing is used:

```python
# Setting password (automatically hashes)
user.set_password(raw_password)
user.save()

# Checking password
user.check_password(raw_password)  # Returns True/False
```

### First Login Password Change

New employees must change their temporary password on first login:

```python
# Employee model
requires_password_change = models.BooleanField(default=False)

# Check on login
if hasattr(user, 'employee_profile'):
    requires_password_change = user.employee_profile.requires_password_change

# Endpoint: POST /api/v1/accounts/auth/first-login-password-change/
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def first_login_password_change(request):
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Mark as changed
        if hasattr(user, 'employee_profile'):
            user.employee_profile.requires_password_change = False
            user.employee_profile.save()
        
        return Response({'message': 'Senha alterada com sucesso.'})
```

---

## 🛡️ Security Measures

### CORS Configuration

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'authorization',
    'content-type',
    'origin',
    'x-csrftoken',
    'x-requested-with',
    'cache-control',
    'x-file-name',
    'x-file-size',
]
```

### CSRF Protection

```python
MIDDLEWARE = [
    # ...
    'django.middleware.csrf.CsrfViewMiddleware',
    # ...
]

# Production settings
if not DEBUG:
    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_HTTPONLY = True
```

### Security Headers (Production)

```python
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    X_FRAME_OPTIONS = 'DENY'
```

### Input Validation

All user input is validated through DRF serializers:

```python
class EmployeeSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    cpf = serializers.CharField(validators=[cpf_validator])
    salary = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    
    def validate_email(self, value):
        if Employee.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value
    
    def validate_cpf(self, value):
        if not cpf_validator.is_valid(value):
            raise serializers.ValidationError("Invalid CPF")
        return value
```

### File Upload Security

```python
# Maximum file size
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB

# Allowed extensions
ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']

# Validation in serializer
def validate_file(self, value):
    if value.size > settings.MAX_UPLOAD_SIZE:
        raise serializers.ValidationError("File too large")
    
    ext = os.path.splitext(value.name)[1][1:].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise serializers.ValidationError("Invalid file type")
    
    return value
```

---

## 🔍 Audit & Logging

### Request Logging

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/django.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### Audit Trail

Critical operations are logged:

```python
import logging

logger = logging.getLogger(__name__)

def approve_termination(request, termination_id):
    termination = get_object_or_404(TerminationRequest, id=termination_id)
    
    logger.info(
        f"Termination approved",
        extra={
            'user_id': request.user.id,
            'termination_id': termination.id,
            'employee_id': termination.funcionario.id,
        }
    )
    
    # ... approval logic
```

---

## 🔑 API Key Management (Future)

For external integrations, API keys can be implemented:

```python
class APIKey(models.Model):
    key = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_key():
        return secrets.token_urlsafe(32)
```

---

## 🚨 Error Handling

### Authentication Errors

```json
{
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid email or password",
    "details": null
  }
}
```

### Permission Errors

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You do not have permission to perform this action",
    "details": {
      "required_role": "admin_rh"
    }
  }
}
```

### Token Errors

```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Access token has expired",
    "details": {
      "refresh_required": true
    }
  }
}
```

---

## 📋 Security Checklist

### Development

- [ ] Use environment variables for secrets
- [ ] Never commit `.env` file
- [ ] Use strong passwords for development accounts
- [ ] Enable CORS only for known origins
- [ ] Log authentication attempts

### Production

- [ ] Use HTTPS everywhere
- [ ] Set `DEBUG = False`
- [ ] Configure secure cookie settings
- [ ] Enable HSTS
- [ ] Set up rate limiting
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Monitor logs for suspicious activity

---

## 🔒 Best Practices

### For Developers

1. **Always validate input** - Never trust client-side validation
2. **Use permission classes** - Check authorization in every view
3. **Hash passwords** - Never store plain text passwords
4. **Log sensitive operations** - Maintain audit trail
5. **Use parameterized queries** - Prevent SQL injection
6. **Sanitize output** - Prevent XSS attacks

### For Users

1. **Use strong passwords** - Minimum 8 characters, mix of types
2. **Change temporary passwords** - On first login
3. **Don't share tokens** - Keep JWT tokens secure
4. **Log out properly** - Especially on shared devices
5. **Report suspicious activity** - Contact IT immediately

---

## 🧪 Testing Security

### Authentication Tests

```python
class AuthenticationTests(APITestCase):
    def test_login_success(self):
        user = User.objects.create_user(
            email='test@example.com',
            password='testpassword123'
        )
        
        response = self.client.post('/api/v1/accounts/auth/login/', {
            'email': 'test@example.com',
            'password': 'testpassword123'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_login_invalid_credentials(self):
        response = self.client.post('/api/v1/accounts/auth/login/', {
            'email': 'wrong@example.com',
            'password': 'wrongpassword'
        })
        
        self.assertEqual(response.status_code, 401)
```

### Permission Tests

```python
class EmployeePermissionTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin@portalrh.com',
            password='admin123',
            role='admin_rh'
        )
        self.employee = User.objects.create_user(
            email='employee@portalrh.com',
            password='employee123',
            role='funcionario'
        )
    
    def test_admin_can_create_employee(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/v1/employees/employees/', {...})
        self.assertEqual(response.status_code, 201)
    
    def test_employee_cannot_create_employee(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.post('/api/v1/employees/employees/', {...})
        self.assertEqual(response.status_code, 403)
```

---

**Next:** [Development](development.md)
