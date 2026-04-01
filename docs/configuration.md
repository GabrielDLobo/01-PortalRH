# Configuration

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `SECRET_KEY` | Django secret | `change-me` |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1` |
| `DATABASE_URL` | Database DSN | `sqlite:///db.sqlite3` |
| `CORS_ALLOWED_ORIGINS` | Frontend origins | `http://localhost:3000` |

## Django Highlights

- Installed apps include all HR modules
- DRF uses JWT authentication by default
- Pagination and filters are enabled

## API Documentation

- Swagger UI: `/api/docs/`
- ReDoc: `/api/redoc/`

## Production Notes

- Set `DEBUG=False`
- Configure HTTPS and secure cookies
- Use PostgreSQL in production
