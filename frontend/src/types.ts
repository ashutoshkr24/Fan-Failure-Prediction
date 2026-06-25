export type FanStatus = 'ok' | 'warning' | 'critical' | 'offline'
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type RiskLevel = 'ok' | 'warning' | 'critical'

export interface Fan {
  id: string
  name: string
  location: string
  unit: string
  model: string | null
  rated_rpm: number
  rated_power_kw: number
  status: FanStatus
  failure_probability: number
  last_maintenance: string | null
  next_maintenance: string | null
  updated_at: string | null
}

export interface SensorReading {
  id: number
  fan_id: string
  timestamp: string
  vibration_mm_s: number | null
  rpm: number | null
  bearing_temp_c: number | null
  shaft_alignment_mm: number | null
  current_a: number | null
  voltage_v: number | null
  power_factor: number | null
  temperature_c: number | null
  noise_db: number | null
  failure_probability: number | null
  anomaly_score: number | null
}

export interface PredictionRequest {
  fan_id: string
  vibration_mm_s: number
  rpm: number
  bearing_temp_c: number
  current_a: number
  temperature_c: number
  noise_db: number
  shaft_alignment_mm?: number
  voltage_v?: number
  power_factor?: number
}

export interface FeatureContribution {
  feature: string
  value: number
  contribution_pct: number
  direction: 'high' | 'low'
}

export interface PredictionResponse {
  fan_id: string
  failure_probability: number
  anomaly_score: number
  risk_level: RiskLevel
  top_contributing_features: FeatureContribution[]
  predicted_rul_hours: number | null
  recommendation: string
  timestamp: string
}

export interface Alert {
  id: number
  fan_id: string
  severity: AlertSeverity
  sensor: string
  message: string
  recommendation: string | null
  value: number | null
  threshold: number | null
  acknowledged: boolean
  resolved: boolean
  created_at: string
}

export interface ModelMetrics {
  model_name: string
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  auc_roc: number
  last_trained: string
  training_samples: number
  feature_count: number
}
