from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import fans, predictions, alerts, models
from app.database import init_db

app = FastAPI(
    title="Fan Failure Prediction API",
    description="ML-powered predictive maintenance for plant operational fans",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

app.include_router(fans.router, prefix="/api/fans", tags=["fans"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(models.router, prefix="/api/models", tags=["models"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "fan-failure-prediction"}
