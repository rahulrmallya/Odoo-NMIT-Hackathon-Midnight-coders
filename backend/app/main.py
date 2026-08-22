from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.database import Base, engine
from app.models import *  # Registers models with SQLAlchemy.
from app.routers import auth, employees, attendance, time_off, salary

app = FastAPI(title="Dayflow HRMS API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=get_settings().cors_origin_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router, prefix="/api/v1")
app.include_router(employees.router, prefix="/api/v1")
app.include_router(attendance.router, prefix="/api/v1")
app.include_router(time_off.router, prefix="/api/v1")
app.include_router(salary.router, prefix="/api/v1")

@app.get("/health")
def health(): return {"status":"ok"}
