# Security

This is a portfolio project, not software running in production with real
user data. The practices below are still followed as they would be in a
production codebase.

## Practices

- **Secrets**: `SECRET_KEY` is required from the environment with no
  fallback; the app fails to start if it is missing. `DEBUG` defaults to
  `False`. Real credentials live only in `.env`, which is git-ignored.
- **Authentication**: JWT via `djangorestframework-simplejwt`, with refresh
  token rotation and blacklisting on rotation. The login and token refresh
  endpoints are rate-limited (`ScopedRateThrottle`) to slow down credential
  and refresh-token brute-forcing.
- **Authorization**: permission classes in `app/permissions.py` enforce
  role-based access (HR vs. regular employee) at both the list/queryset
  level and the object level, so retrieving, updating, or deleting a record
  you don't own returns 403/404 instead of leaking it.
- **File uploads**: employee documents are checked against an extension
  whitelist, a size limit, and a magic-byte signature match against the
  declared extension, so a disallowed file type renamed with an allowed
  extension is rejected.
- **Transport and headers**: when `DEBUG=False`, HSTS (including preload),
  SSL redirect, secure cookies, and `X-Frame-Options: DENY` are enabled.
- **Dependencies and static analysis**: `bandit` and `pip-audit` run in CI
  on every push and pull request, alongside `ruff` and the test suite.
- **API documentation**: Swagger/Redoc are intentionally left public as a
  portfolio decision, so the API surface can be reviewed without
  authenticating.

## Reporting a vulnerability

Please report vulnerabilities privately using
[GitHub's private vulnerability reporting](https://github.com/GabrielDLobo/01-PortalRH/security/advisories/new)
for this repository, rather than opening a public issue. Include the
affected endpoint or file, steps to reproduce, and the potential impact.
