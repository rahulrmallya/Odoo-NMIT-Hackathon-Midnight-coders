import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session, selectinload
from app.core.security import hash_password
from app.models.employee import Employee, Skill, Certification
from app.models.user import User, Role
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, ProfileUpdate, EmployeeOut

def as_out(e: Employee) -> EmployeeOut:
    return EmployeeOut(id=str(e.id), employee_id=e.employee_code, name=e.name, email=e.email, mobile=e.mobile, profile_picture=e.profile_picture, company=e.company, department=e.department, position=e.position, manager_id=str(e.manager_id) if e.manager_id else None, location=e.location, joining_date=e.joining_date, date_of_birth=e.date_of_birth, address=e.address, about=e.about, interests=e.interests, skills=[s.name for s in e.skills], certifications=[c.name for c in e.certifications])
def get(db: Session, employee_id: str) -> Employee:
    try: employee_uuid = uuid.UUID(employee_id)
    except (ValueError, TypeError): raise HTTPException(status_code=422, detail="Invalid employee ID")
    e=db.query(Employee).options(selectinload(Employee.skills), selectinload(Employee.certifications)).filter(Employee.id==employee_uuid).first()
    if not e: raise HTTPException(status_code=404, detail="Employee not found")
    return e
def list_all(db: Session): return [as_out(e) for e in db.query(Employee).options(selectinload(Employee.skills),selectinload(Employee.certifications)).order_by(Employee.name)]
def apply(e: Employee, data: EmployeeUpdate | EmployeeCreate):
    for field in EmployeeUpdate.model_fields:
        if field not in {"skills","certifications"}: setattr(e, field, getattr(data,field))
    e.skills=[Skill(name=name) for name in data.skills]; e.certifications=[Certification(name=name) for name in data.certifications]
def create(db: Session, data: EmployeeCreate):
    code=data.employee_id or f"DF-{db.query(Employee).count()+1001}"
    if db.query(Employee).filter((Employee.employee_code==code)|(Employee.email==data.email)).first(): raise HTTPException(status_code=409, detail="Employee ID or email already exists")
    e=Employee(employee_code=code, name=data.name, email=data.email); apply(e,data); db.add(e); db.flush(); db.add(User(login_id=code, password_hash=hash_password(data.password), role=Role.EMPLOYEE, employee_id=e.id)); db.commit(); return as_out(get(db,str(e.id)))
def update(db: Session, employee_id: str, data: EmployeeUpdate):
    e=get(db,employee_id)
    duplicate = db.query(Employee).filter(Employee.email == data.email, Employee.id != e.id).first()
    if duplicate: raise HTTPException(status_code=409, detail="Email already exists")
    apply(e,data); db.commit(); return as_out(get(db,employee_id))
def update_profile(db: Session, employee_id: str, data: ProfileUpdate):
    e=get(db,employee_id)
    for key,value in data.model_dump(exclude_unset=True).items(): setattr(e,key,value)
    db.commit(); return as_out(get(db,employee_id))
