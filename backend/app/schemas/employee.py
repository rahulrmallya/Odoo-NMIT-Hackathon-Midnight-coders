from datetime import date
from pydantic import BaseModel, EmailStr, Field

class EmployeeBase(BaseModel):
    name: str; email: EmailStr; mobile: str | None = None; profile_picture: str | None = None; company: str | None = None
    department: str | None = None; position: str | None = None; manager_id: str | None = None; location: str | None = None
    joining_date: date | None = None; date_of_birth: date | None = None; address: str | None = None; about: str | None = None; interests: str | None = None
    skills: list[str] = Field(default_factory=list); certifications: list[str] = Field(default_factory=list)
class EmployeeCreate(EmployeeBase): employee_id: str | None = None; password: str = Field(min_length=8)
class EmployeeUpdate(EmployeeBase): pass
class ProfileUpdate(BaseModel): mobile: str | None = None; profile_picture: str | None = None; address: str | None = None; about: str | None = None; interests: str | None = None
class EmployeeOut(EmployeeBase): id: str; employee_id: str
