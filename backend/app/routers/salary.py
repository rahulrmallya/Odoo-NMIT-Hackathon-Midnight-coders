from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.schemas.salary import SalaryOut,SalaryUpsert
from app.services import salary_service
router=APIRouter(prefix="/employees",tags=["salary"])
@router.get("/{id}/salary",response_model=SalaryOut)
def get_salary(id:str,db:Session=Depends(get_db),user=Depends(require_admin)): return salary_service.get(db,id)
@router.put("/{id}/salary",response_model=SalaryOut)
def put_salary(id:str,data:SalaryUpsert,db:Session=Depends(get_db),user=Depends(require_admin)): return salary_service.upsert(db,id,data)
