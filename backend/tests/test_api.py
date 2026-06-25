"""
pytest tests for the Fan Failure Prediction API.
Run:  pytest backend/tests/ -v
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import init_db


@pytest.fixture(scope="module")
async def client():
    await init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_list_fans(client):
    r = await client.get("/api/fans/")
    assert r.status_code == 200
    fans = r.json()
    assert isinstance(fans, list)
    assert len(fans) == 9


@pytest.mark.asyncio
async def test_predict_ok(client):
    payload = {
        "fan_id": "FAN-01",
        "vibration_mm_s": 0.9,
        "rpm": 1458,
        "bearing_temp_c": 40,
        "current_a": 14.1,
        "temperature_c": 43,
        "noise_db": 61,
    }
    r = await client.post("/api/predictions/", json=payload)
    assert r.status_code == 200
    body = r.json()
    assert body["risk_level"] == "ok"
    assert 0 <= body["failure_probability"] <= 40


@pytest.mark.asyncio
async def test_predict_critical(client):
    payload = {
        "fan_id": "FAN-03",
        "vibration_mm_s": 6.2,
        "rpm": 1375,
        "bearing_temp_c": 73,
        "current_a": 20.1,
        "temperature_c": 78,
        "noise_db": 85,
    }
    r = await client.post("/api/predictions/", json=payload)
    assert r.status_code == 200
    body = r.json()
    assert body["risk_level"] == "critical"
    assert body["failure_probability"] >= 70


@pytest.mark.asyncio
async def test_ingest_reading(client):
    payload = {
        "fan_id": "FAN-02",
        "vibration_mm_s": 2.1,
        "rpm": 1425,
        "bearing_temp_c": 53,
        "current_a": 16.5,
        "temperature_c": 55,
        "noise_db": 70,
    }
    r = await client.post("/api/fans/FAN-02/readings", json=payload)
    assert r.status_code == 200
    body = r.json()
    assert "failure_probability" in body


@pytest.mark.asyncio
async def test_list_alerts(client):
    r = await client.get("/api/alerts/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_model_metrics(client):
    r = await client.get("/api/models/")
    assert r.status_code == 200
    models = r.json()
    assert len(models) == 3
    assert models[0]["accuracy"] > 90
