from fastapi import APIRouter
from app.schemas import ModelMetrics
from datetime import datetime

router = APIRouter()

STATIC_METRICS = [
    ModelMetrics(
        model_name="Random Forest Classifier",
        accuracy=94.2,
        precision=91.8,
        recall=96.1,
        f1_score=93.9,
        auc_roc=97.4,
        last_trained=datetime(2026, 6, 24, 18, 0, 0),
        training_samples=54_210,
        feature_count=9,
    ),
    ModelMetrics(
        model_name="LSTM Sequence Model",
        accuracy=91.6,
        precision=89.3,
        recall=93.7,
        f1_score=91.4,
        auc_roc=95.8,
        last_trained=datetime(2026, 6, 23, 12, 0, 0),
        training_samples=48_000,
        feature_count=9,
    ),
    ModelMetrics(
        model_name="Isolation Forest (Anomaly)",
        accuracy=88.5,
        precision=85.1,
        recall=90.2,
        f1_score=87.5,
        auc_roc=93.1,
        last_trained=datetime(2026, 6, 24, 18, 0, 0),
        training_samples=54_210,
        feature_count=9,
    ),
]


@router.get("/", response_model=list[ModelMetrics])
def get_model_metrics():
    return STATIC_METRICS
