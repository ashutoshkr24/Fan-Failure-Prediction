from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, Boolean, Enum, Text
from sqlalchemy.sql import func
import enum
from app.database import Base


class AlertSeverity(str, enum.Enum):
    info = "info"
    warning = "warning"
    critical = "critical"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fan_id = Column(String, ForeignKey("fans.id"), nullable=False, index=True)
    severity = Column(Enum(AlertSeverity), nullable=False)
    sensor = Column(String, nullable=False)          # which sensor triggered
    message = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)
    value = Column(Float, nullable=True)             # triggering sensor value
    threshold = Column(Float, nullable=True)         # threshold that was breached
    acknowledged = Column(Boolean, default=False)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now(), index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
