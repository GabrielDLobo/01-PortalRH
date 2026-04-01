# Testing

## Strategy

- Unit tests for models and serializers
- API tests for endpoints and permissions
- Integration tests for business flows

## Run Tests

<pre><code>python manage.py test
pytest
pytest --cov=.</code></pre>
## Run Specific Module

<pre><code>pytest employees/
pytest reports/</code></pre>
## Quality Checklist

- Critical paths covered
- Permission boundaries tested
- Validation and error responses verified
