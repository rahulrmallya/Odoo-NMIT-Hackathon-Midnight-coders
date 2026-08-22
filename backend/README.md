# Dayflow backend

FastAPI + SQLAlchemy backend for Dayflow. It uses **only local PostgreSQL** and exposes the API under `http://localhost:8000/api/v1`.

## Setup

1. Start your local PostgreSQL service and create a database named `dayflow`.
2. Copy `.env.example` to `.env` and enter local credentials and a strong JWT secret.
3. Install dependencies: `pip install -r requirements.txt`
4. Seed tables and demo data: `python -m app.seed`
5. Start the API: `uvicorn app.main:app --reload --port 8000`

Run commands from the `backend` directory. The API base URL is `http://localhost:8000/api/v1`.

## Frontend integration

The backend allows the Lovable/Vite frontend at `http://localhost:5173`. Send the login token as an `Authorization: Bearer <token>` header for protected requests.

## Demo credentials

- Admin: `admin` / `Admin@123`
- Employee: `DF-1001` / `Employee@123`

Change these immediately outside local demo use. `.env` is ignored by Git; `.env.example` contains only placeholders.
