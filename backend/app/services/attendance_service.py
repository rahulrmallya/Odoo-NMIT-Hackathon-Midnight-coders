from datetime import datetime, timezone
import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.attendance import Attendance, AttendanceStatus
from app.schemas.attendance import AttendanceOut

def as_out(a): return AttendanceOut(id=str(a.id), employee_id=str(a.employee_id), date=a.date, check_in=a.check_in, check_out=a.check_out, work_hours=float(a.work_hours), extra_hours=float(a.extra_hours), status=a.status)
def records(db, employee_id=None):
    q=db.query(Attendance)
    if employee_id:
        try: employee_uuid = uuid.UUID(str(employee_id))
        except (ValueError, TypeError): raise HTTPException(status_code=422, detail="Invalid employee ID")
        q=q.filter(Attendance.employee_id==employee_uuid)
    return [as_out(a) for a in q.order_by(Attendance.date.desc()).all()]
def check_in(db, employee_id):
    now=datetime.now(timezone.utc); existing=db.query(Attendance).filter(Attendance.employee_id==employee_id, Attendance.date==now.date()).first()
    if existing: raise HTTPException(status_code=409, detail="Attendance already exists for today")
    a=Attendance(employee_id=employee_id,date=now.date(),check_in=now,status=AttendanceStatus.PRESENT); db.add(a); db.commit(); db.refresh(a); return as_out(a)
def check_out(db, employee_id):
    today = datetime.now(timezone.utc).date()
    a=db.query(Attendance).filter(Attendance.employee_id==employee_id, Attendance.date==today).first()
    if not a or not a.check_in: raise HTTPException(status_code=400, detail="Check in before checking out")
    if a.check_out: raise HTTPException(status_code=409, detail="Already checked out")
    a.check_out=datetime.now(timezone.utc); a.work_hours=round((a.check_out-a.check_in).total_seconds()/3600,2); a.extra_hours=max(0,round(float(a.work_hours)-8,2)); db.commit(); return as_out(a)
