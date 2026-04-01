# Guidelines and Standards

## Code Style

- Follow PEP 8 for Python
- Prefer small, testable service functions
- Keep serializers focused on validation and representation

## API Conventions

- Use clear resource names
- Return proper HTTP status codes
- Validate all inputs in serializers

## Git Workflow

<pre><code>git checkout -b feature/short-description
git add .
git commit -m &quot;feat(module): concise message&quot;
git push origin feature/short-description</code></pre>
## Pull Request Checklist

- Tests updated
- Documentation updated
- No debug leftovers
- Backward compatibility verified
