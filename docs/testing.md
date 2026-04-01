# Testing

## Strategy

- Unit tests for models and serializers
- API tests for endpoints and permissions
- Integration tests for business flows

## Run Tests

```bash
python manage.py test
pytest
pytest --cov=.
```

## Run Specific Module

```bash
pytest employees/
pytest reports/
```

## Quality Checklist

- Critical paths covered
- Permission boundaries tested
- Validation and error responses verified
