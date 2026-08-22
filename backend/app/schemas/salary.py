from pydantic import BaseModel, Field
class SalaryComponents(BaseModel):
    basic_salary: float = 0; hra: float = 0; standard_allowance: float = 0; performance_bonus: float = 0; leave_travel_allowance: float = 0; fixed_allowance: float = 0
class SalaryUpsert(BaseModel): working_days: int = Field(default=22, ge=1); break_time: int = Field(default=60, ge=0); salary_components: SalaryComponents
class SalaryOut(BaseModel): id: str; employee_id: str; monthly_wage: float; yearly_wage: float; working_days: int; break_time: int; salary_components: SalaryComponents
