// ENG-001E: Suitability Engine — Module Barrel
export { computeSuitability } from './aggregator';
export { scoreTopology } from './topology-dimension';
export { scoreTraversal } from './traversal-dimension';
export { scoreComplexity } from './complexity-dimension';
export { scoreGovernance } from './governance-dimension';
export type {
  SuitabilityResult,
  SuitabilityDimension,
  SuitabilityInput,
  SuitabilitySources,
  ArchitecturalFit,
  SuitabilityDimensionKey,
} from './suitability-types';
export { SUITABILITY_WEIGHTS } from './suitability-types';
