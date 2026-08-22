from datetime import date, datetime
from pydantic import BaseModel
from app.models.attendance import AttendanceStatus
class AttendanceOut(BaseModel):
    id: str; employee_id: str; date: date; check_in: datetime | None; check_out: datetime | None; work_hours: float; extra_hours: float; status: AttendanceStatus
