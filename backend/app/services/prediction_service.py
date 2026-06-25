"""
Fan Failure Prediction Service
-------------------------------
Uses a Random Forest classifier for failure probability and
Isolation Forest for anomaly detection.
In production: load pre-trained joblib models from disk.
Here we build and fit on synthetic bootstrap data so the service
is immediately runnable without a separate training step.
"""

import numpy as np
from datetime import datetime
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)


# Sensor threshold table  (warn, critical)
THRESHOLDS = {
    "vibration_mm_s":    (2.8, 5.0),
    "bearing_temp_c":    (55.0, 70.0),
    "temperature_c":     (60.0, 75.0),
    "current_a":         (17.0, 19.5),
    "noise_db":          (72.0, 82.0),
    "shaft_alignment_mm":(0.05, 0.10),
    "rpm":               (1410.0, 1390.0),   # lower = worse for RPM
}

FEATURE_NAMES = [
    "vibration_mm_s",
    "bearing_temp_c",
    "temperature_c",
    "current_a",
    "noise_db",
    "shaft_alignment_mm",
    "rpm_delta",           # deviation from rated RPM
    "power_factor",
    "vib_x_temp",          # interaction feature
]

# RUL regression coefficients (simplified physics-based estimate)
RUL_INTERCEPT = 2000.0
RUL_PROB_COEFF = -18.0


class FanPredictionService:
    """Singleton ML service — bootstraps models on first call."""

    _rf_model = None
    _iso_model = None
    _is_fitted = False

    @classmethod
    def _ensure_fitted(cls):
        if cls._is_fitted:
            return
        try:
            from sklearn.ensemble import RandomForestClassifier, IsolationForest
            logger.info("Fitting bootstrap ML models…")
            X, y = cls._generate_synthetic_data(n=3000)
            cls._rf_model = RandomForestClassifier(
                n_estimators=150,
                max_depth=8,
                min_samples_leaf=5,
                class_weight="balanced",
                random_state=42,
            )
            cls._rf_model.fit(X, y)
            cls._iso_model = IsolationForest(
                n_estimators=100,
                contamination=0.12,
                random_state=42,
            )
            cls._iso_model.fit(X)
            cls._is_fitted = True
            logger.info("ML models ready.")
        except ImportError:
            logger.warning("scikit-learn not installed — using heuristic predictor.")

    @staticmethod
    def _generate_synthetic_data(n: int = 3000) -> Tuple[np.ndarray, np.ndarray]:
        rng = np.random.default_rng(42)
        # Healthy samples (~75%)
        n_healthy = int(n * 0.75)
        healthy = rng.normal(
            loc=[1.0, 42.0, 45.0, 14.5, 62.0, 0.02, -10.0, 0.87, 42.0],
            scale=[0.4,  3.0,  4.0,  0.8,  3.0, 0.01,   8.0, 0.02, 2.0],
            size=(n_healthy, 9),
        )
        # Failing samples (~25%)
        n_fail = n - n_healthy
        failing = rng.normal(
            loc=[5.0, 68.0, 72.0, 19.0, 80.0, 0.09, -60.0, 0.72, 360.0],
            scale=[1.2,  6.0,  6.0,  1.5,  5.0, 0.02,  15.0, 0.05, 50.0],
            size=(n_fail, 9),
        )
        X = np.vstack([healthy, failing])
        y = np.array([0] * n_healthy + [1] * n_fail)
        return X, y

    @staticmethod
    def _build_feature_vector(data: Dict) -> np.ndarray:
        rated_rpm = 1500.0
        rpm_delta = data.get("rpm", rated_rpm) - rated_rpm
        vib = data.get("vibration_mm_s", 1.0)
        temp = data.get("temperature_c", 45.0)
        return np.array([[
            vib,
            data.get("bearing_temp_c", 42.0),
            temp,
            data.get("current_a", 14.5),
            data.get("noise_db", 62.0),
            data.get("shaft_alignment_mm", 0.02),
            rpm_delta,
            data.get("power_factor", 0.87),
            vib * temp,
        ]])

    @classmethod
    def predict(cls, data: Dict) -> Dict:
        cls._ensure_fitted()
        X = cls._build_feature_vector(data)

        if cls._is_fitted:
            fail_prob = float(cls._rf_model.predict_proba(X)[0][1]) * 100
            iso_raw = float(cls._iso_model.score_samples(X)[0])
            # Normalise iso score to 0-1 (lower = more anomalous)
            anomaly_score = round(max(0.0, min(1.0, (iso_raw + 0.5) / 0.8)), 3)
        else:
            fail_prob, anomaly_score = cls._heuristic_predict(data)

        fail_prob = round(min(100.0, max(0.0, fail_prob)), 1)

        if fail_prob >= 70:
            risk_level = "critical"
        elif fail_prob >= 40:
            risk_level = "warning"
        else:
            risk_level = "ok"

        features = cls._feature_contributions(data, fail_prob)
        rul = max(0.0, round(RUL_INTERCEPT + RUL_PROB_COEFF * fail_prob, 0))
        recommendation = cls._generate_recommendation(risk_level, features)

        return {
            "fan_id": data.get("fan_id", ""),
            "failure_probability": fail_prob,
            "anomaly_score": anomaly_score,
            "risk_level": risk_level,
            "top_contributing_features": features[:3],
            "predicted_rul_hours": rul,
            "recommendation": recommendation,
            "timestamp": datetime.utcnow(),
        }

    @staticmethod
    def _heuristic_predict(data: Dict) -> Tuple[float, float]:
        """Fallback when sklearn is unavailable."""
        score = 0.0
        vib = data.get("vibration_mm_s", 1.0)
        temp = data.get("bearing_temp_c", 42.0)
        curr = data.get("current_a", 14.5)
        rpm = data.get("rpm", 1500.0)
        score += max(0, (vib - 1.0) / 7.0) * 40
        score += max(0, (temp - 40.0) / 50.0) * 30
        score += max(0, (curr - 14.0) / 8.0) * 20
        score += max(0, (1460.0 - rpm) / 100.0) * 10
        return round(min(score, 100.0), 1), round(score / 100, 3)

    @staticmethod
    def _feature_contributions(data: Dict, prob: float) -> List[Dict]:
        thresholds = {
            "vibration_mm_s": (1.0, 5.0, "Vibration"),
            "bearing_temp_c": (42.0, 70.0, "Bearing temp"),
            "temperature_c":  (45.0, 75.0, "Temperature"),
            "current_a":      (14.5, 19.5, "Current draw"),
            "noise_db":       (62.0, 82.0, "Noise level"),
        }
        contribs = []
        for key, (normal, worst, label) in thresholds.items():
            val = data.get(key, normal)
            deviation = abs(val - normal) / max(abs(worst - normal), 1e-6)
            contribution = round(min(deviation * prob, prob), 1)
            contribs.append({
                "feature": label,
                "value": val,
                "contribution_pct": contribution,
                "direction": "high" if val > normal else "low",
            })
        contribs.sort(key=lambda x: x["contribution_pct"], reverse=True)
        return contribs

    @staticmethod
    def _generate_recommendation(risk_level: str, features: List[Dict]) -> str:
        top = features[0]["feature"] if features else "sensor readings"
        recs = {
            "critical": (
                f"URGENT: Schedule immediate inspection. Primary concern: {top}. "
                "Isolate fan if safe to do so. Check bearings, coupling, and motor windings."
            ),
            "warning": (
                f"Schedule preventive maintenance within 72 hours. Focus on {top}. "
                "Increase monitoring frequency and inspect lubrication."
            ),
            "ok": (
                "Fan is operating within normal parameters. "
                "Continue standard maintenance schedule."
            ),
        }
        return recs.get(risk_level, "Monitor closely.")


def check_thresholds(fan_id: str, data: Dict) -> List[Dict]:
    """Return list of threshold breaches as alert dicts."""
    alerts = []
    checks = [
        ("vibration_mm_s", "Vibration",
         "Reduce load or inspect rotor balance. Check bearing condition.",
         "Vibration exceeds {level} threshold ({val:.1f} mm/s > {thr:.1f})"),
        ("bearing_temp_c", "Bearing temperature",
         "Check lubrication level and quality. Inspect bearing for wear.",
         "Bearing temp exceeds {level} threshold ({val:.0f}°C > {thr:.0f}°C)"),
        ("temperature_c", "Motor temperature",
         "Check cooling path, ambient temperature, and motor load.",
         "Motor temp exceeds {level} threshold ({val:.0f}°C > {thr:.0f}°C)"),
        ("current_a", "Motor current",
         "Check motor windings for insulation degradation.",
         "Current exceeds {level} threshold ({val:.1f} A > {thr:.1f} A)"),
        ("noise_db", "Noise level",
         "Perform acoustic inspection. Check for loose components.",
         "Noise exceeds {level} threshold ({val:.0f} dB > {thr:.0f} dB)"),
    ]
    for key, sensor, rec, msg_tmpl in checks:
        val = data.get(key)
        if val is None:
            continue
        warn_thr, crit_thr = THRESHOLDS.get(key, (None, None))
        if warn_thr is None:
            continue
        # For RPM, lower is worse
        if key == "rpm":
            if val <= crit_thr:
                level, thr, severity = "critical", crit_thr, "critical"
            elif val <= warn_thr:
                level, thr, severity = "warning", warn_thr, "warning"
            else:
                continue
        else:
            if val >= crit_thr:
                level, thr, severity = "critical", crit_thr, "critical"
            elif val >= warn_thr:
                level, thr, severity = "warning", warn_thr, "warning"
            else:
                continue
        alerts.append({
            "fan_id": fan_id,
            "severity": severity,
            "sensor": sensor,
            "message": msg_tmpl.format(level=level, val=val, thr=thr),
            "recommendation": rec,
            "value": val,
            "threshold": thr,
        })

    return alerts
