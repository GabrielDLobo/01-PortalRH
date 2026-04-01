# Overview

## About PortalRH

PortalRH is a Human Resources Management System built with **Django REST Framework** and **React + TypeScript**.

Core domains:
- Employee lifecycle
- Leave management
- Performance evaluations
- Admission and termination workflows
- Reports and analytics

## Main Capabilities

| Module | Highlights |
|---|---|
| Employees | Profiles, documents, admission progress |
| Leave Requests | Request, approval, balances, priorities |
| Evaluations | Templates, criteria, cycles, scores |
| Reports | Dynamic templates, exports, scheduling |
| Termination | Reasons, approval flow, supporting documents |

## Architecture Summary

```text
Frontend (React + TypeScript) -> DRF API (JWT) -> PostgreSQL/SQLite
```

## Project Status

- Version: `1.0.0`
- API style: REST
- Auth: JWT Bearer token
- Docs: MkDocs Material
