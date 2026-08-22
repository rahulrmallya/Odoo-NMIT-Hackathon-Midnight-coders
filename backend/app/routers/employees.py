from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import current_user, require_admin
from app.models.user import Role
from app.schemas.employee import EmployeeCreate,EmployeeUpdate,EmployeeOut,ProfileUpdate
from app.services import employee_service
router=APIRouter(prefix="/employees",tags=["employees"])
@router.get("",response_model=list[EmployeeOut])
def list_employees(db:Session=Depends(get_db),user=Depends(current_user)):
    if user.role != Role.ADMIN:
        if not user.employee_id: raise HTTPException(status_code=403, detail="Employee access required")
        return [employee_service.as_out(employee_service.get(db, str(user.employee_id)))]
    return employee_service.list_all(db)
@router.get("/{id}",response_model=EmployeeOut)
def get_employee(id:str,db:Session=Depends(get_db),user=Depends(current_user)):
    if user.role != Role.ADMIN and str(user.employee_id) != id: raise HTTPException(status_code=403,detail="Employee access denied")
    return employee_service.as_out(employee_service.get(db,id))
@router.post("",response_model=EmployeeOut,status_code=status.HTTP_201_CREATED)
def create_employee(data:EmployeeCreate,db:Session=Depends(get_db),user=Depends(require_admin)): return employee_service.create(db,data)
@router.put("/{id}",response_model=EmployeeOut)
def update_employee(id:str,data:EmployeeUpdate,db:Session=Depends(get_db),user=Depends(require_admin)): return employee_service.update(db,id,data)
@router.delete("/{id}",status_code=204)
def delete_employee(id:str,db:Session=Depends(get_db),user=Depends(require_admin)):
    emp=employee_service.get(db,id); db.delete(emp); db.commit()
@router.get("/{id}/profile",response_model=EmployeeOut)
def get_profile(id:str,db:Session=Depends(get_db),user=Depends(current_user)):
    if user.role!=Role.ADMIN and str(user.employee_id)!=id: raise HTTPException(status_code=403,detail="Profile access denied")
    return employee_service.as_out(employee_service.get(db,id))
@router.put("/{id}/profile",response_model=EmployeeOut)
def update_profile(id:str,data:ProfileUpdate,db:Session=Depends(get_db),user=Depends(current_user)):
    if user.role!=Role.ADMIN and str(user.employee_id)!=id: raise HTTPException(status_code=403,detail="Profile update denied")
    return employee_service.update_profile(db,id,data)
