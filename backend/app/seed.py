"""Run `python -m app.seed` after creating the PostgreSQL database."""
from datetime import date, datetime, timedelta, timezone
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import Employee, User, Role, Attendance, AttendanceStatus, TimeOff, LeaveType, TimeOffStatus, Salary, Skill, Certification

def main():
    Base.metadata.create_all(engine); db=SessionLocal()
    try:
        if db.query(User).first(): print("Database already contains users; seed skipped."); return
        db.add(User(login_id="admin",password_hash=hash_password("Admin@123"),role=Role.ADMIN)); employees=[]
        names=["Aarav Sharma","Diya Patel","Kabir Singh","Ananya Iyer","Vihaan Rao","Myra Nair","Arjun Mehta","Isha Kapoor","Rohan Das"]
        for i,name in enumerate(names,1):
            e=Employee(employee_code=f"DF-{1000+i}",name=name,email=f"employee{i}@dayflow.com",mobile=f"90000000{i}",company="Dayflow",department=["Engineering","People","Design"][i%3],position=["Engineer","Analyst","Designer"][i%3],joining_date=date(2024,i,1),location="Bengaluru",skills=[Skill(name="Communication"),Skill(name="Teamwork")],certifications=[Certification(name="Workplace Essentials")])
            db.add(e); db.flush(); db.add(User(login_id=e.employee_code,password_hash=hash_password("Employee@123"),role=Role.EMPLOYEE,employee_id=e.id)); employees.append(e)
            comps={"basic_salary":35000+i*1000,"hra":12000,"standard_allowance":3000,"performance_bonus":2000,"leave_travel_allowance":1000,"fixed_allowance":1500}; monthly=sum(comps.values())
            db.add(Salary(employee_id=e.id,monthly_wage=monthly,yearly_wage=monthly*12,working_days=22,break_time=60,salary_components=comps))
            for offset in range(1,4):
                day=date.today()-timedelta(days=offset); check=datetime.combine(day,datetime.min.time(),tzinfo=timezone.utc)+timedelta(hours=9,minutes=i)
                db.add(Attendance(employee_id=e.id,date=day,check_in=check,check_out=check+timedelta(hours=8,minutes=15),work_hours=8.25,extra_hours=.25,status=AttendanceStatus.PRESENT))
        db.flush(); db.add(TimeOff(employee_id=employees[0].id,leave_type=LeaveType.PAID,start_date=date.today()+timedelta(days=5),end_date=date.today()+timedelta(days=6),remarks="Family event",status=TimeOffStatus.PENDING)); db.add(TimeOff(employee_id=employees[1].id,leave_type=LeaveType.SICK,start_date=date.today()-timedelta(days=8),end_date=date.today()-timedelta(days=7),remarks="Recovery",status=TimeOffStatus.APPROVED,admin_comment="Take care.")); db.commit(); print("Seed complete. Admin: admin / Admin@123; Employee: DF-1001 / Employee@123")
    finally: db.close()
if __name__=="__main__": main()
