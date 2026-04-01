# Installation

## 1. Clone Repository

<pre><code>git clone https://github.com/GabrielDLobo/01-PortalRH.git
cd 01-PortalRH</code></pre>
## 2. Create Virtual Environment

<pre><code>python -m venv venv
venv\Scripts\activate</code></pre>
## 3. Install Dependencies

<pre><code>pip install -r requirements.txt</code></pre>
## 4. Configure Environment

Create `.env` in project root:

<pre><code>SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3</code></pre>
## 5. Prepare Database

<pre><code>python manage.py migrate
python manage.py createsuperuser</code></pre>
## 6. Start Backend

<pre><code>python manage.py runserver</code></pre>
## 7. Start Frontend

<pre><code>cd frontend
npm install
npm run dev</code></pre>