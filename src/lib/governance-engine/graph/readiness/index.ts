// ENG-001D: Readiness Score — Module Barrel
export { computeReadiness } from './aggregator';
export { calculateIntegrity } from './dimensions/integrity';
export { calculateCompleteness } from './dimensions/completeness';
export { calculateConnectivity } from './dimensions/connectivity';
export { calculateTraceability } from './dimensions/traceability';
export { buildExplanation } from './explanation';
export type {
  ReadinessDimension,
  ReadinessResult,
  ReadinessSources,
  ReadinessInput,
  ReadinessDimensionKey,
} from './types/readiness-types';
export { READINESS_WEIGHTS } from './types/readiness-types';
