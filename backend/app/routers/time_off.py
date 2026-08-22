from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import current_user,require_admin
from app.models.user import Role
from app.models.time_off import TimeOffStatus
from app.schemas.time_off import TimeOffCreate,TimeOffDecision,TimeOffOut
from app.services import time_off_service
router=APIRouter(prefix="/time-off",tags=["time-off"])
@router.get("",response_model=list[TimeOffOut])
def list_time_off(db:Session=Depends(get_db),user=Depends(current_user)): return time_off_service.list_requests(db,None if user.role==Role.ADMIN else user.employee_id)
@router.post("",response_model=TimeOffOut,status_code=201)
def create_time_off(data:TimeOffCreate,db:Session=Depends(get_db),user=Depends(current_user)):
    if user.role!=Role.ADMIN and str(user.employee_id)!=data.employee_id: raise HTTPException(status_code=403,detail="Can only request time off for yourself")
    return time_off_service.create(db,data)
@router.patch("/{id}/approve",response_model=TimeOffOut)
def approve(id:str,data:TimeOffDecision,db:Session=Depends(get_db),user=Depends(require_admin)): return time_off_service.decide(db,id,TimeOffStatus.APPROVED,data.admin_comment)
@router.patch("/{id}/reject",response_model=TimeOffOut)
def reject(id:str,data:TimeOffDecision,db:Session=Depends(get_db),user=Depends(require_admin)): return time_off_service.decide(db,id,TimeOffStatus.REJECTED,data.admin_comment)
