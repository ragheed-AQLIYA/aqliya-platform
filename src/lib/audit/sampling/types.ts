export type SamplingMethod = "random" | "high_value" | "monetary_unit";

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
  };
  generatedAt: string;
  disclaimer: string;
}
