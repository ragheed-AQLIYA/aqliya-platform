// ─── Sales Pipeline Intelligence — Barrel Export ───

export {
  scoreDeal,
  getDealHealth,
  listDealHealth,
  createForecast,
  getForecast,
  listForecasts,
  calculateForecast,
  getPipelineAnalytics,
  getWinRateAnalysis,
  getVelocityMetrics,
  _resetForecastsForTest,
} from "./sales-intel-service"

export { intl, t } from "./intel-strings"

export type {
  DealScore,
  DealHealthIndicator,
  SalesForecast,
  PipelineAnalytics,
  WinRateData,
  VelocityMetrics,
  CreateForecastInput,
  WinRateQuery,
  HealthLevel,
  ForecastPeriod,
} from "./sales-intel-service"
