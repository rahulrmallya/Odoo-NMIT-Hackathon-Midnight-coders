from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import LoginResponse, UserOut

def login(db: Session, login_id: str, password: str) -> LoginResponse:
    user = db.query(User).filter(User.login_id == login_id).first()
    if not user or not verify_password(password, user.password_hash): raise HTTPException(status_code=401, detail="Invalid login ID or password")
    emp = user.employee
    return LoginResponse(access_token=create_access_token(str(user.id)), user=UserOut(id=str(user.id), employee_id=str(emp.id) if emp else None, name=emp.name if emp else "Dayflow Admin", email=emp.email if emp else None, role=user.role))
