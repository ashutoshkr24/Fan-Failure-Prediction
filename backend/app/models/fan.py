from sqlalchemy import Column, String, Float, Integer, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.database import Base


class FanStatus(str, enum.Enum):
    ok = "ok"
    warning = "warning"
    critical = "critical"
    offline = "offline"


class Fan(Base):
    __tablename__ = "fans"

    id = Column(String, primary_key=True, index=True)        # e.g. "FAN-01"
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    unit = Column(String, nullable=False, default="Unit-3")
    model = Column(String, nullable=True)
    installed_date = Column(DateTime, nullable=True)
    rated_rpm = Column(Float, nullable=False, default=1500.0)
    rated_power_kw = Column(Float, nullable=False, default=22.0)
    status = Column(Enum(FanStatus), default=FanStatus.ok)
    failure_probability = Column(Float, default=0.0)
    last_maintenance = Column(DateTime, nullable=True)
    next_maintenance = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
