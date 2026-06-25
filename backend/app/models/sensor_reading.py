from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer
from sqlalchemy.sql import func
from app.database import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fan_id = Column(String, ForeignKey("fans.id"), nullable=False, index=True)
    timestamp = Column(DateTime, server_default=func.now(), index=True)

    # Mechanical sensors
    vibration_mm_s = Column(Float)          # vibration velocity mm/s (normal < 2.8)
    rpm = Column(Float)                     # rotational speed
    bearing_temp_c = Column(Float)          # bearing temperature °C (normal < 55)
    shaft_alignment_mm = Column(Float)      # shaft alignment deviation mm

    # Electrical sensors
    current_a = Column(Float)              # motor current draw (Amps)
    voltage_v = Column(Float)              # supply voltage
    power_factor = Column(Float)           # power factor 0-1

    # Environmental / acoustic
    temperature_c = Column(Float)          # ambient/winding temperature °C
    noise_db = Column(Float)               # sound pressure level dB

    # Derived / computed
    failure_probability = Column(Float)    # ML model output 0-100
    anomaly_score = Column(Float)          # isolation forest score
