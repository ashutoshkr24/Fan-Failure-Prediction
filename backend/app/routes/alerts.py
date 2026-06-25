from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List, Optional
from app.database import get_db
from app.models.alert import Alert
from app.schemas import AlertResponse
from datetime import datetime

router = APIRouter()


@router.get("/", response_model=List[AlertResponse])
async def list_alerts(
    fan_id: Optional[str] = Query(None),
    resolved: bool = Query(False),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    q = select(Alert).where(Alert.resolved == resolved).order_by(Alert.created_at.desc()).limit(limit)
    if fan_id:
        q = q.where(Alert.fan_id == fan_id)
    result = await db.execute(q)
    return result.scalars().all()


@router.patch("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(
        update(Alert)
        .where(Alert.id == alert_id)
        .values(acknowledged=True, acknowledged_at=datetime.utcnow())
    )
    await db.commit()
    return {"status": "acknowledged"}


@router.patch("/{alert_id}/resolve")
async def resolve_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(
        update(Alert)
        .where(Alert.id == alert_id)
        .values(resolved=True, resolved_at=datetime.utcnow())
    )
    await db.commit()
    return {"status": "resolved"}
