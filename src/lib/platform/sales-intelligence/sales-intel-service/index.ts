// ─── Sales Pipeline Intelligence — Domain Module Barrel ───

export { scoreDeal } from "./scoring"
export { getDealHealth, listDealHealth } from "./health"
export {
  createForecast,
  getForecast,
  listForecasts,
  calculateForecast,
  _resetForecastsForTest,
} from "./forecasting"
export {
  getPipelineAnalytics,
  getWinRateAnalysis,
  getVelocityMetrics,
} from "./analytics"

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
} from "./common"
