import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.salary import Salary
from app.models.employee import Employee
from app.schemas.salary import SalaryUpsert, SalaryOut

def as_out(s): return SalaryOut(id=str(s.id),employee_id=str(s.employee_id),monthly_wage=float(s.monthly_wage),yearly_wage=float(s.yearly_wage),working_days=s.working_days,break_time=s.break_time,salary_components=s.salary_components)
def get(db, employee_id):
    try: employee_uuid = uuid.UUID(employee_id)
    except (ValueError, TypeError): raise HTTPException(status_code=422, detail="Invalid employee ID")
    s=db.query(Salary).filter(Salary.employee_id==employee_uuid).first()
    if not s: raise HTTPException(status_code=404,detail="Salary not found")
    return as_out(s)
def upsert(db, employee_id, data: SalaryUpsert):
    try: employee_uuid = uuid.UUID(employee_id)
    except (ValueError, TypeError): raise HTTPException(status_code=422, detail="Invalid employee ID")
    if not db.get(Employee, employee_uuid): raise HTTPException(status_code=404, detail="Employee not found")
    components=data.salary_components.model_dump(); monthly=round(sum(components.values()),2)
    s=db.query(Salary).filter(Salary.employee_id==employee_uuid).first()
    if not s: s=Salary(employee_id=employee_uuid,monthly_wage=monthly,yearly_wage=monthly*12,working_days=data.working_days,break_time=data.break_time,salary_components=components); db.add(s)
    else: s.monthly_wage=monthly; s.yearly_wage=monthly*12; s.working_days=data.working_days; s.break_time=data.break_time; s.salary_components=components
    db.commit(); db.refresh(s); return as_out(s)
