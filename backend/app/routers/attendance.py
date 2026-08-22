from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import current_user
from app.models.user import Role
from app.schemas.attendance import AttendanceOut
from app.services import attendance_service
router=APIRouter(prefix="/attendance",tags=["attendance"])
@router.post("/check-in",response_model=AttendanceOut)
def check_in(db:Session=Depends(get_db),user=Depends(current_user)):
    if not user.employee_id: raise HTTPException(status_code=403,detail="Admin cannot check in")
    return attendance_service.check_in(db,user.employee_id)
@router.post("/check-out",response_model=AttendanceOut)
def check_out(db:Session=Depends(get_db),user=Depends(current_user)):
    if not user.employee_id: raise HTTPException(status_code=403,detail="Admin cannot check out")
    return attendance_service.check_out(db,user.employee_id)
@router.get("",response_model=list[AttendanceOut])
def all_attendance(db:Session=Depends(get_db),user=Depends(current_user)): return attendance_service.records(db,None if user.role==Role.ADMIN else user.employee_id)
@router.get("/{employee_id}",response_model=list[AttendanceOut])
def employee_attendance(employee_id:str,db:Session=Depends(get_db),user=Depends(current_user)):
    if user.role!=Role.ADMIN and str(user.employee_id)!=employee_id: raise HTTPException(status_code=403,detail="Attendance access denied")
    return attendance_service.records(db,employee_id)
