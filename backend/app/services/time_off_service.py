import uuid
from fastapi import HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session
from app.models.time_off import TimeOff, TimeOffStatus
from app.models.employee import Employee
from app.schemas.time_off import TimeOffCreate, TimeOffOut

def as_out(t): return TimeOffOut(id=str(t.id),employee_id=str(t.employee_id),leave_type=t.leave_type,start_date=t.start_date,end_date=t.end_date,remarks=t.remarks,status=t.status,admin_comment=t.admin_comment)
def list_requests(db, employee_id=None):
    q=db.query(TimeOff)
    if employee_id: q=q.filter(TimeOff.employee_id==employee_id)
    return [as_out(t) for t in q.order_by(TimeOff.start_date.desc()).all()]
def create(db: Session, data: TimeOffCreate):
    try: employee_uuid = uuid.UUID(data.employee_id)
    except (ValueError, TypeError): raise HTTPException(status_code=422, detail="Invalid employee ID")
    if not db.get(Employee, employee_uuid): raise HTTPException(status_code=404, detail="Employee not found")
    overlap=db.query(TimeOff).filter(TimeOff.employee_id==employee_uuid, TimeOff.status != TimeOffStatus.REJECTED, TimeOff.start_date<=data.end_date, TimeOff.end_date>=data.start_date).first()
    if overlap: raise HTTPException(status_code=409, detail="Overlapping leave request exists")
    t=TimeOff(employee_id=employee_uuid,leave_type=data.leave_type,start_date=data.start_date,end_date=data.end_date,remarks=data.remarks); db.add(t); db.commit(); db.refresh(t); return as_out(t)
def decide(db, request_id: str, status: TimeOffStatus, comment: str | None):
    try: request_uuid = uuid.UUID(request_id)
    except (ValueError, TypeError): raise HTTPException(status_code=422, detail="Invalid time-off request ID")
    t=db.get(TimeOff,request_uuid)
    if not t: raise HTTPException(status_code=404, detail="Time-off request not found")
    if t.status != TimeOffStatus.PENDING: raise HTTPException(status_code=409, detail="Request has already been decided")
    t.status=status; t.admin_comment=comment; db.commit(); return as_out(t)
