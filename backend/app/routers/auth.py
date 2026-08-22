from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import current_user
from app.schemas.auth import LoginRequest, LoginResponse, UserOut
from app.services.auth_service import login
router=APIRouter(prefix="/auth",tags=["auth"])
@router.post("/login",response_model=LoginResponse)
def login_route(data: LoginRequest,db: Session=Depends(get_db)): return login(db,data.login_id,data.password)
@router.get("/me",response_model=UserOut)
def me(user=Depends(current_user)):
    e=user.employee; return UserOut(id=str(user.id),employee_id=str(e.id) if e else None,name=e.name if e else "Dayflow Admin",email=e.email if e else None,role=user.role)
@router.post("/logout")
def logout(user=Depends(current_user)): return {"message":"Logged out successfully"}
