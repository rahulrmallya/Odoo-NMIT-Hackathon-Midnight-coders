from datetime import date
from pydantic import BaseModel, model_validator
from app.models.time_off import LeaveType, TimeOffStatus
class TimeOffCreate(BaseModel):
    employee_id: str; leave_type: LeaveType; start_date: date; end_date: date; remarks: str | None = None
    @model_validator(mode="after")
    def dates_valid(self):
        if self.end_date < self.start_date: raise ValueError("end_date must be on or after start_date")
        return self
class TimeOffDecision(BaseModel): admin_comment: str | None = None
class TimeOffOut(BaseModel):
    id: str; employee_id: str; leave_type: LeaveType; start_date: date; end_date: date; remarks: str | None; status: TimeOffStatus; admin_comment: str | None
