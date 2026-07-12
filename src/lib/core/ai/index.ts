/**
 * AI Execution Engine facade — orchestrator + governed product bridge.
 */
export {
  AIEngine,
  execute,
  isCoreAIEnabled,
  type CoreAIDomain,
  type CoreAIAuditRequest,
  type CoreAIExecuteRequest,
  type CoreAIExecuteResult,
  type CoreAIOfficeRequest,
  type CoreAIProductRequest,
  type GovernedAuditAIResult,
  type GovernedOfficeAIInput,
  type GovernedOfficeAIResult,
  type GovernedProductAIInput,
  type GovernedProductAIResult,
  type RunGovernedAuditAIParams,
} from "./engine";

export { aiOrchestrator, type GenerateEvent, type OrchestratorConfig } from "./orchestrator";

export {
  isProductAICoreEnabled,
  runGovernedProductAI,
  assertProductScope,
} from "@/lib/platform/product-ai-bridge";

export { routeIntelligenceRequest } from "./intelligence-runtime";

export {
  AICostGovernance,
  checkOrgAIBudget,
  getOrgAIBudgetConfig,
  getOrgAIBudgetStatus,
  type BudgetQuotaResult,
  type BudgetStatus,
} from "./cost-governance";

export {
  AIEvalGate,
  runEvalGate,
  checkConfidenceThreshold,
  suggestThresholdForModel,
  evalGate,
  type EvalGateResult,
  type EvalGateInput,
  type EvalGateResultContent,
  type ConfidenceGateInput,
  type ConfidenceGateResult,
} from "./eval-gate";

export {
  calculateConfidence,
  confidenceLabel,
  type ConfidenceInput,
  type ConfidenceScore,
} from "./confidence-scorer";

export {
  generateAiQualityReport,
  type AiOutputReport,
} from "./quality-report";

export {
  BudgetQuotaExceededError,
  governedAIExecute,
  type GovernedAIExecuteResult,
} from "./governed-ai-executor";

export type { AIProviderId, AIRequest, AIResponse } from "./types";

export * from "./providers";
