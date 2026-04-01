# Installation

## 1. Clone Repository

```bash
git clone https://github.com/GabrielDLobo/01-PortalRH.git
cd 01-PortalRH
```

## 2. Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 4. Configure Environment

Create `.env` in project root:

```env
SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

## 5. Prepare Database

```bash
python manage.py migrate
python manage.py createsuperuser
```

## 6. Start Backend

```bash
python manage.py runserver
```

## 7. Start Frontend

```bash
cd frontend
npm install
npm run dev
```
