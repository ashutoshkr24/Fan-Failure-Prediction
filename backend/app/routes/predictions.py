from fastapi import APIRouter, HTTPException
from app.schemas import PredictionRequest, PredictionResponse
from app.services.prediction_service import FanPredictionService

router = APIRouter()


@router.post("/", response_model=PredictionResponse)
async def predict_failure(request: PredictionRequest):
    """
    Run failure prediction for a single fan reading.
    Returns probability, risk level, feature contributions, and RUL estimate.
    """
    try:
        result = FanPredictionService.predict(request.model_dump())
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}")


@router.get("/batch-status")
async def batch_status():
    """
    Return a snapshot of all fans' current risk levels.
    In production this would query the latest reading per fan.
    """
    return {"message": "Use GET /api/fans/ for per-fan status."}
