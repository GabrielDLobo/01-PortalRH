# Deploy

## Deployment Options

- Docker Compose
- VPS with Gunicorn + Nginx

## Docker Compose

<pre><code>docker-compose build
docker-compose up -d
docker-compose logs -f</code></pre>
## Production Essentials

- `DEBUG=False`
- strong `SECRET_KEY`
- PostgreSQL configured
- HTTPS enabled
- static and media persistence configured

## Post-Deploy Checklist

- Health endpoint responding
- Admin login working
- API docs accessible
- Logs monitored
