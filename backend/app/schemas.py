from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class FanStatus(str, Enum):
    ok = "ok"
    warning = "warning"
    critical = "critical"
    offline = "offline"


class AlertSeverity(str, Enum):
    info = "info"
    warning = "warning"
    critical = "critical"


# ── Fan schemas ────────────────────────────────────────────────

class FanBase(BaseModel):
    name: str
    location: str
    unit: str = "Unit-3"
    model: Optional[str] = None
    rated_rpm: float = 1500.0
    rated_power_kw: float = 22.0


class FanCreate(FanBase):
    id: str


class FanResponse(FanBase):
    id: str
    status: FanStatus
    failure_probability: float
    last_maintenance: Optional[datetime]
    next_maintenance: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Sensor reading schemas ─────────────────────────────────────

class SensorReadingCreate(BaseModel):
    fan_id: str
    vibration_mm_s: Optional[float] = None
    rpm: Optional[float] = None
    bearing_temp_c: Optional[float] = None
    shaft_alignment_mm: Optional[float] = None
    current_a: Optional[float] = None
    voltage_v: Optional[float] = None
    power_factor: Optional[float] = None
    temperature_c: Optional[float] = None
    noise_db: Optional[float] = None


class SensorReadingResponse(SensorReadingCreate):
    id: int
    timestamp: datetime
    failure_probability: Optional[float]
    anomaly_score: Optional[float]

    model_config = {"from_attributes": True}


# ── Prediction schemas ─────────────────────────────────────────

class PredictionRequest(BaseModel):
    fan_id: str
    vibration_mm_s: float = Field(..., ge=0, le=50)
    rpm: float = Field(..., ge=0, le=3000)
    bearing_temp_c: float = Field(..., ge=-10, le=200)
    current_a: float = Field(..., ge=0, le=100)
    temperature_c: float = Field(..., ge=-10, le=200)
    noise_db: float = Field(..., ge=0, le=150)
    shaft_alignment_mm: Optional[float] = 0.0
    voltage_v: Optional[float] = 415.0
    power_factor: Optional[float] = 0.85


class PredictionResponse(BaseModel):
    fan_id: str
    failure_probability: float          # 0-100 %
    anomaly_score: float                # isolation forest
    risk_level: str                     # ok / warning / critical
    top_contributing_features: List[dict]
    predicted_rul_hours: Optional[float]  # Remaining Useful Life
    recommendation: str
    timestamp: datetime


# ── Alert schemas ──────────────────────────────────────────────

class AlertResponse(BaseModel):
    id: int
    fan_id: str
    severity: AlertSeverity
    sensor: str
    message: str
    recommendation: Optional[str]
    value: Optional[float]
    threshold: Optional[float]
    acknowledged: bool
    resolved: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Model metrics schemas ──────────────────────────────────────

class ModelMetrics(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    auc_roc: float
    last_trained: datetime
    training_samples: int
    feature_count: int
