export type SamplingMethod = "random" | "high_value" | "monetary_unit" | "stratified" | "systematic";

export interface SamplingStatistics {
  confidenceLevel: number;
  confidenceInterval: number;
  marginOfError: number;
  standardDeviation: number;
  standardError: number;
  sampleSize: number;
  populationSize: number;
  recommendedMinSampleSize: number;
}

export interface StratifiedSamplingStratum {
  label: string;
  populationItems: number;
  sampleItems: number;
  totalBalance: number;
  proportion: number;
}

export interface SamplingPopulationItem {
  id: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
}

export interface SamplingRequest {
  method: SamplingMethod;
  sampleSize: number;
  seed?: string;
  materialityThreshold?: number;
  confidenceLevel?: number; // 0.90, 0.95, 0.99
  marginOfError?: number; // as decimal 0.05 = 5%
  strataField?: string; // field name for stratification
  strataLabels?: string[]; // labels for strata
  randomStart?: number; // for systematic sampling
  interval?: number; // for systematic sampling
}

export interface SamplingResult {
  method: SamplingMethod;
  populationCount: number;
  sampleSize: number;
  seed: string;
  selectedIds: string[];
  selectedItems: SamplingPopulationItem[];
  parameters: {
    materialityThreshold?: number;
    totalAbsoluteBalance: number;
    confidenceLevel?: number;
    marginOfError?: number;
  };
  statistics?: SamplingStatistics;
  strata?: StratifiedSamplingStratum[];
  interval?: number;
  randomStart?: number;
  generatedAt: string;
  disclaimer: string;
}
