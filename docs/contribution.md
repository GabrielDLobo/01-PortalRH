# Contribution Guide

This guide provides information on how to contribute to the Inventory Management System project.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Code of Conduct](#code-of-conduct)
3. [How to Contribute](#how-to-contribute)
4. [Development Workflow](#development-workflow)
5. [Submitting Changes](#submitting-changes)
6. [Code Review Process](#code-review-process)
7. [Bug Reports](#bug-reports)
8. [Feature Requests](#feature-requests)
9. [Documentation](#documentation)
10. [Recognition](#recognition)

---

## Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub to create your copy
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/02-Inventory-Management-System.git
cd 02-Inventory-Management-System
```

### 2. Set Up Development Environment

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
pip install -r requirements_dev.txt

# Set up pre-commit hooks
pre-commit install
```

### 3. Create a Branch

```bash
# Always branch from develop
git checkout develop

# Create feature branch
git checkout -b feature/your-feature-name
```

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

**Examples of behavior that contributes to creating a positive environment:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**

- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project maintainers.

---

## How to Contribute

### Ways to Contribute

| Type | Description |
|------|-------------|
| **Code** | Fix bugs, implement features, optimize performance |
| **Documentation** | Improve docs, add examples, fix typos |
| **Testing** | Write tests, improve coverage |
| **Design** | Improve UI/UX, create assets |
| **Bug Reports** | Report bugs with detailed information |
| **Feature Requests** | Suggest new features |
| **Code Review** | Review pull requests |
| **Community** | Help others, answer questions |

### First Contributions

If this is your first contribution, here are some good starting points:

1. Fix a typo in documentation
2. Add missing docstrings
3. Fix a simple bug
4. Write a test for existing code
5. Improve error messages

Look for issues labeled `good first issue` or `help wanted`.

---

## Development Workflow

### Branch Naming Convention

```
feature/add-export-functionality    # New features
bugfix/fix-login-error              # Bug fixes
docs/update-readme                  # Documentation
refactor/optimize-queries           # Refactoring
test/add-product-tests              # Tests
chore/update-dependencies           # Maintenance
```

### Making Changes

```bash
# Make your changes
# Write tests
# Update documentation

# Stage changes
git add .

# Commit with conventional commits
git commit -m "feat: add export to CSV functionality"

# Push to your fork
git push origin feature/add-export-functionality
```

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```bash
feat(products): add bulk import functionality
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
refactor(inflows): optimize database queries
test(products): add unit tests for serializers
chore(deps): update django to 5.0.1
```

---

## Submitting Changes

### Pull Request Process

1. **Fork and Branch**
   ```bash
   git checkout develop
   git checkout -b feature/your-feature
   ```

2. **Make Changes**
   - Write clean, tested code
   - Follow coding standards
   - Update documentation

3. **Run Tests**
   ```bash
   pytest
   flake8
   black --check .
   isort --check-only .
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature
   # Go to GitHub and create Pull Request
   ```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Test coverage maintained or improved

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated

## Related Issues
Closes #123
```

---

## Code Review Process

### Reviewer Guidelines

**What to look for:**

1. **Correctness**
   - Does the code work as intended?
   - Are edge cases handled?
   - Are there any bugs?

2. **Security**
   - Any security vulnerabilities?
   - Proper input validation?
   - No sensitive data exposure?

3. **Performance**
   - Efficient algorithms?
   - Database queries optimized?
   - No unnecessary operations?

4. **Code Quality**
   - Follows style guidelines?
   - Proper naming?
   - Good code organization?
   - Adequate comments?

5. **Testing**
   - Tests included?
   - Tests cover edge cases?
   - Tests are meaningful?

### Review Responses

**Approve:**
```
LGTM! Code looks good. Approved.
```

**Request Changes:**
```
Thanks for the PR! I have some suggestions:

1. Line 45: Consider using select_related here to avoid N+1 queries
2. Line 78: Add validation for negative values
3. Missing tests for the edge case when...

Please address these before merging.
```

**Comment:**
```
Interesting approach! Have you considered using X instead?
```

---

## Bug Reports

### How to Report a Bug

1. **Check Existing Issues**
   Search to see if the bug has already been reported.

2. **Create a New Issue**
   Use the bug report template.

3. **Provide Details**
   Include as much information as possible.

### Bug Report Template

```markdown
## Bug Description
Clear description of what the bug is

## To Reproduce
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 11, macOS, Ubuntu]
- Python version: [e.g., 3.11]
- Browser: [e.g., Chrome 120]

## Screenshots
If applicable

## Additional Context
Any other relevant information
```

---

## Feature Requests

### How to Request a Feature

1. **Check Existing Requests**
   Search to see if the feature has been requested.

2. **Create a New Issue**
   Use the feature request template.

3. **Provide Details**
   Explain the use case and benefits.

### Feature Request Template

```markdown
## Feature Description
What feature would you like?

## Problem Statement
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Any alternative solutions you've thought of

## Use Cases
Who would use this and how?

## Additional Context
Any other relevant information
```

---

## Documentation

### Documentation Standards

1. **Code Comments**
   - Explain why, not what
   - Keep comments up to date
   - Use docstrings for functions/classes

2. **Docstrings**
   Use Google-style docstrings:

   ```python
   def calculate_profit(cost, price, quantity):
       """
       Calculate total profit.
       
       Args:
           cost: Cost price per unit
           price: Selling price per unit
           quantity: Number of units
       
       Returns:
           Total profit amount
       
       Raises:
           ValueError: If price < cost
       """
       if price < cost:
           raise ValueError('Price cannot be less than cost')
       return (price - cost) * quantity
   ```

3. **README Updates**
   - Update for new features
   - Keep installation instructions current
   - Include screenshots for UI changes

4. **API Documentation**
   - Document all endpoints
   - Include request/response examples
   - Note authentication requirements

---

## Recognition

### Contributors

We recognize all contributors in our README and documentation.

### Hall of Fame

Significant contributors are listed in our CONTRIBUTOR.md file.

### Release Notes

Contributors are mentioned in release notes for their contributions.

---

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search discussions on GitHub
3. Open a discussion thread
4. Contact maintainers

---

## Thank You!

Every contribution, no matter how small, makes a difference. We appreciate your time and effort in making this project better!

**Happy Contributing! 🎉**
