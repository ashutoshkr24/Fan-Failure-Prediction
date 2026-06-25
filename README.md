# FanGuard AI — Plant Fan Failure Prediction System

A full-stack predictive maintenance platform for industrial plant fans, combining real-time sensor telemetry, ML-based failure prediction, and an operator dashboard.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                       │
│   Dashboard · Fan grid · Sensor panels · Trend charts       │
│   Alert management · ML model metrics · Recharts viz        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP / REST
┌────────────────────▼────────────────────────────────────────┐
│                     FastAPI Backend                         │
│   /api/fans · /api/predictions · /api/alerts · /api/models  │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │              Prediction Service                      │  │
│   │  Random Forest Classifier  ·  Isolation Forest       │  │
│   │  Feature extraction  ·  Threshold checks             │  │
│   │  RUL estimation  ·  Alert generation                 │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                             │
│   SQLite (dev) / PostgreSQL (prod) via SQLAlchemy async     │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

### Dashboard
- Real-time KPI bar: critical / warning / healthy fan counts
- 3×3 fan grid with colour-coded failure probability
- Per-fan sensor telemetry: vibration, temperature, bearing temp, current, noise, RPM
- 72-hour trend chart with warning/critical reference lines
- Active alert panel with acknowledge actions
- ML model performance (Random Forest, LSTM, Isolation Forest) with radar chart

### ML Prediction Engine
- **Random Forest Classifier** — failure probability (0–100%)
- **Isolation Forest** — anomaly score for unseen fault patterns
- **9 features**: vibration, bearing temp, motor temp, current draw, noise, shaft alignment, RPM delta, power factor, vib×temp interaction
- **Remaining Useful Life (RUL)** regression estimate in hours
- Feature contribution breakdown — explains which sensors drive the prediction
- Rule-based threshold alerts as a safety net alongside the ML models

### Sensor Thresholds (ISO 10816 / plant standards)

| Sensor | Warning | Critical |
|---|---|---|
| Vibration (mm/s) | 2.8 | 5.0 |
| Bearing temp (°C) | 55 | 70 |
| Motor temp (°C) | 60 | 75 |
| Current draw (A) | 17 | 19.5 |
| Noise (dB) | 72 | 82 |
| RPM (drop from rated) | <1410 | <1390 |

---

## Quick Start

### Option 1 — Docker Compose (recommended)

```bash
git clone <repo>
cd fan-failure-prediction
docker compose up --build
```

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

### Option 2 — Local development

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

---

## API Reference

### POST /api/predictions/
Run failure prediction for a fan reading.

```json
{
  "fan_id": "FAN-03",
  "vibration_mm_s": 5.6,
  "rpm": 1382,
  "bearing_temp_c": 71,
  "current_a": 19.4,
  "temperature_c": 74,
  "noise_db": 82
}
```

Response:
```json
{
  "fan_id": "FAN-03",
  "failure_probability": 83.4,
  "anomaly_score": 0.82,
  "risk_level": "critical",
  "top_contributing_features": [
    { "feature": "Vibration", "value": 5.6, "contribution_pct": 41.7, "direction": "high" },
    { "feature": "Bearing temp", "value": 71, "contribution_pct": 33.4, "direction": "high" }
  ],
  "predicted_rul_hours": 491.0,
  "recommendation": "URGENT: Schedule immediate inspection...",
  "timestamp": "2026-06-25T10:00:00Z"
}
```

### POST /api/fans/{fan_id}/readings
Ingest a sensor reading — runs prediction and generates alerts automatically.

### GET /api/fans/
List all fans with current status and failure probability.

### GET /api/alerts/?resolved=false
List active (unresolved) alerts.

### PATCH /api/alerts/{id}/acknowledge
Acknowledge an alert.

### GET /api/models/
ML model performance metrics.

---

## Project Structure

```
fan-failure-prediction/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app + CORS
│   │   ├── database.py                # SQLAlchemy async engine
│   │   ├── schemas.py                 # Pydantic request/response models
│   │   ├── models/
│   │   │   ├── fan.py                 # Fan ORM model
│   │   │   ├── sensor_reading.py      # Sensor reading ORM model
│   │   │   └── alert.py               # Alert ORM model
│   │   ├── routes/
│   │   │   ├── fans.py                # Fan CRUD + reading ingestion
│   │   │   ├── predictions.py         # Prediction endpoint
│   │   │   ├── alerts.py              # Alert management
│   │   │   └── models.py              # Model metrics
│   │   └── services/
│   │       └── prediction_service.py  # RF + Isolation Forest + thresholds
│   ├── tests/
│   │   └── test_api.py                # pytest async API tests
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    # Root with sidebar nav
│   │   ├── main.tsx                   # React entry point
│   │   ├── types.ts                   # TypeScript interfaces
│   │   ├── services/api.ts            # Axios API layer
│   │   ├── hooks/useFans.ts           # Polling hook + demo data
│   │   ├── pages/Dashboard.tsx        # Main dashboard layout
│   │   └── components/
│   │       ├── KPIBar.tsx             # 5-metric top bar
│   │       ├── FanCard.tsx            # Fan status card
│   │       ├── SensorPanel.tsx        # Sensor bar chart panel
│   │       ├── TrendChart.tsx         # Recharts line chart
│   │       ├── AlertPanel.tsx         # Active alerts with ack
│   │       ├── ModelPanel.tsx         # ML metrics + radar chart
│   │       └── Sidebar.tsx            # Navigation sidebar
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```

---

## Production Notes

- Replace SQLite with PostgreSQL: set `DATABASE_URL=postgresql+asyncpg://...`
- Replace bootstrap-trained RF with pre-trained joblib models loaded from disk
- Add authentication (JWT or OAuth2) via FastAPI's `security` module
- Integrate real SCADA / OPC-UA sensor feeds into the `/api/fans/{id}/readings` endpoint
- Deploy the ML training pipeline separately; expose a `/api/models/retrain` endpoint
- Use Redis for caching the latest reading per fan, reducing DB load on the polling frontend
