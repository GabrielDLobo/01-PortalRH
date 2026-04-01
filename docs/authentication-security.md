# Authentication and Security

## Authentication Model

PortalRH uses JWT authentication with access and refresh tokens.

## Main Endpoints

- `POST /api/v1/accounts/auth/login/`
- `POST /api/v1/accounts/auth/refresh/`
- `POST /api/v1/accounts/auth/verify/`

## Authorization

- Role-based access control
- Admin RH permissions for critical operations
- Object-level checks where required

## Security Controls

- Input validation in DRF serializers
- Secure password policies
- CORS restrictions
- Security headers in production

## Recommended Production Settings

<pre><code>DEBUG = False
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True</code></pre>