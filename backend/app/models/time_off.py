import enum, uuid
from datetime import date
from sqlalchemy import Date, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class LeaveType(str, enum.Enum): PAID="PAID"; SICK="SICK"; UNPAID="UNPAID"
class TimeOffStatus(str, enum.Enum): PENDING="PENDING"; APPROVED="APPROVED"; REJECTED="REJECTED"


class TimeOff(Base):
    __tablename__ = "time_off"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    employee_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    leave_type: Mapped[LeaveType] = mapped_column(Enum(LeaveType))
    start_date: Mapped[date] = mapped_column(Date, index=True)
    end_date: Mapped[date] = mapped_column(Date, index=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[TimeOffStatus] = mapped_column(Enum(TimeOffStatus), default=TimeOffStatus.PENDING, index=True)
    admin_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
