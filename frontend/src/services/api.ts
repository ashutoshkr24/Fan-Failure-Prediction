import axios from 'axios'
import type { Fan, SensorReading, PredictionRequest, PredictionResponse, Alert, ModelMetrics } from '../types'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

export const fanApi = {
  list: () => api.get<Fan[]>('/fans/').then(r => r.data),
  get:  (id: string) => api.get<Fan>(`/fans/${id}`).then(r => r.data),
  getReadings: (id: string, limit = 96) =>
    api.get<SensorReading[]>(`/fans/${id}/readings?limit=${limit}`).then(r => r.data),
  ingestReading: (id: string, reading: Omit<PredictionRequest, 'fan_id'>) =>
    api.post<SensorReading>(`/fans/${id}/readings`, { ...reading, fan_id: id }).then(r => r.data),
}

export const predictionApi = {
  predict: (req: PredictionRequest) =>
    api.post<PredictionResponse>('/predictions/', req).then(r => r.data),
}

export const alertApi = {
  list: (resolved = false) =>
    api.get<Alert[]>(`/alerts/?resolved=${resolved}`).then(r => r.data),
  listForFan: (fanId: string) =>
    api.get<Alert[]>(`/alerts/?fan_id=${fanId}`).then(r => r.data),
  acknowledge: (id: number) =>
    api.patch(`/alerts/${id}/acknowledge`).then(r => r.data),
  resolve: (id: number) =>
    api.patch(`/alerts/${id}/resolve`).then(r => r.data),
}

export const modelApi = {
  metrics: () => api.get<ModelMetrics[]>('/models/').then(r => r.data),
}
