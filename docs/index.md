# PortalRH Documentation

<div class="hero-box">
	<p><strong>PortalRH</strong> is a full Human Resources platform built with Django REST Framework and React + TypeScript.</p>
	<p>Use this documentation as the main entry point for architecture, setup, API contracts, testing, and deployment.</p>
</div>

## Documentation Map

<div class="doc-grid" markdown>

<a class="doc-card" href="overview.md">
	<strong>Overview</strong><br>
	Product vision, core modules, and tech stack.
</a>

<a class="doc-card" href="prerequisites.md">
	<strong>Prerequisites</strong><br>
	Required tools and environment versions.
</a>

<a class="doc-card" href="installation.md">
	<strong>Installation</strong><br>
	Step-by-step setup for backend and frontend.
</a>

<a class="doc-card" href="configuration.md">
	<strong>Configuration</strong><br>
	Environment variables and project settings.
</a>

<a class="doc-card" href="project-structure.md">
	<strong>Project Structure</strong><br>
	Directory layout and responsibilities.
</a>

<a class="doc-card" href="api-endpoints.md">
	<strong>API Endpoints</strong><br>
	Endpoint catalog and usage patterns.
</a>

<a class="doc-card" href="authentication-security.md">
	<strong>Authentication and Security</strong><br>
	JWT flow, roles, permissions, and hardening.
</a>

<a class="doc-card" href="development.md">
	<strong>Development</strong><br>
	Workflow, coding standards, and conventions.
</a>

<a class="doc-card" href="testing.md">
	<strong>Testing</strong><br>
	Test strategy, execution commands, and scope.
</a>

<a class="doc-card" href="deploy.md">
	<strong>Deploy</strong><br>
	Production deployment checklist and guides.
</a>

<a class="doc-card" href="contributing.md">
	<strong>Contributing</strong><br>
	Branching, review process, and collaboration rules.
</a>

<a class="doc-card" href="release-notes.md">
	<strong>Release Notes</strong><br>
	Version timeline and change log.
</a>

</div>

## Quick Start

```bash
git clone https://github.com/GabrielDLobo/01-PortalRH.git
cd 01-PortalRH

# Use the existing project venv
venv\Scripts\python -m pip install -r requirements.txt

venv\Scripts\python manage.py migrate
venv\Scripts\python manage.py runserver
```

## Local Documentation Preview

```bash
venv\Scripts\python -m mkdocs serve
```

## Platform Snapshot

| Metric | Value |
|---|---|
| Backend | Django 5.2.6 + DRF 3.16.1 |
| Frontend | React 19 + TypeScript |
| Auth | JWT (SimpleJWT 5.5.1) |
| Databases | SQLite (dev), PostgreSQL (prod) |
| API Base Path | /api/v1/ |

## Support

If you find a documentation issue, open an issue in the repository and include the affected page URL.
