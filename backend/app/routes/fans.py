from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from app.database import get_db
from app.models.fan import Fan, FanStatus
from app.models.sensor_reading import SensorReading
from app.schemas import FanCreate, FanResponse, SensorReadingCreate, SensorReadingResponse
from app.services.prediction_service import FanPredictionService, check_thresholds
from app.models.alert import Alert, AlertSeverity
from datetime import datetime, timedelta
import random

router = APIRouter()


@router.get("/", response_model=List[FanResponse])
async def list_fans(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Fan).order_by(Fan.id))
    fans = result.scalars().all()
    if not fans:
        # Seed demo data on first run
        fans = await _seed_demo_fans(db)
    return fans


@router.get("/{fan_id}", response_model=FanResponse)
async def get_fan(fan_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Fan).where(Fan.id == fan_id))
    fan = result.scalar_one_or_none()
    if not fan:
        raise HTTPException(status_code=404, detail=f"Fan {fan_id} not found")
    return fan


@router.post("/", response_model=FanResponse)
async def create_fan(fan_data: FanCreate, db: AsyncSession = Depends(get_db)):
    fan = Fan(**fan_data.model_dump())
    db.add(fan)
    await db.commit()
    await db.refresh(fan)
    return fan


@router.post("/{fan_id}/readings", response_model=SensorReadingResponse)
async def ingest_sensor_reading(
    fan_id: str,
    reading: SensorReadingCreate,
    db: AsyncSession = Depends(get_db),
):
    # Run ML prediction
    payload = reading.model_dump()
    payload["fan_id"] = fan_id
    result = FanPredictionService.predict(payload)

    # Persist reading
    db_reading = SensorReading(
        **payload,
        failure_probability=result["failure_probability"],
        anomaly_score=result["anomaly_score"],
    )
    db.add(db_reading)

    # Update fan status
    status_map = {
        "critical": FanStatus.critical,
        "warning": FanStatus.warning,
        "ok": FanStatus.ok,
    }
    await db.execute(
        update(Fan)
        .where(Fan.id == fan_id)
        .values(
            status=status_map[result["risk_level"]],
            failure_probability=result["failure_probability"],
            updated_at=datetime.utcnow(),
        )
    )

    # Generate threshold alerts
    threshold_alerts = check_thresholds(fan_id, payload)
    for a in threshold_alerts:
        db_alert = Alert(
            fan_id=a["fan_id"],
            severity=AlertSeverity(a["severity"]),
            sensor=a["sensor"],
            message=a["message"],
            recommendation=a["recommendation"],
            value=a["value"],
            threshold=a["threshold"],
        )
        db.add(db_alert)

    await db.commit()
    await db.refresh(db_reading)
    return db_reading


@router.get("/{fan_id}/readings", response_model=List[SensorReadingResponse])
async def get_readings(fan_id: str, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SensorReading)
        .where(SensorReading.fan_id == fan_id)
        .order_by(SensorReading.timestamp.desc())
        .limit(limit)
    )
    return result.scalars().all()


async def _seed_demo_fans(db: AsyncSession) -> list:
    demo_fans = [
        {"id": f"FAN-{i:02d}", "name": f"Exhaust Fan {i:02d}",
         "location": f"Section {chr(64+((i-1)//3+1))}", "unit": "Unit-3",
         "model": "Howden HF-22", "rated_rpm": 1500.0, "rated_power_kw": 22.0}
        for i in range(1, 10)
    ]
    fans = []
    for fd in demo_fans:
        fan = Fan(**fd)
        db.add(fan)
        fans.append(fan)
    await db.commit()
    return fans
