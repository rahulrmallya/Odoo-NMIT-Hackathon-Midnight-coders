import uuid
from sqlalchemy import ForeignKey, Integer, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Salary(Base):
    __tablename__ = "salaries"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    employee_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), unique=True, index=True)
    monthly_wage: Mapped[float] = mapped_column(Numeric(12,2))
    yearly_wage: Mapped[float] = mapped_column(Numeric(12,2))
    working_days: Mapped[int] = mapped_column(Integer, default=22)
    break_time: Mapped[int] = mapped_column(Integer, default=60)
    salary_components: Mapped[dict] = mapped_column(JSONB, default=dict)
