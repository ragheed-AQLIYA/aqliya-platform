export interface SkillInfo {
  skillId: string;
  skillName: string;
  version: string;
  level: number;
  category: string;
  description: string;
  hasDataset: boolean;
  criteriaCount: number;
}

export interface ApiSkillListResponse {
  skills: SkillInfo[];
  summary: {
    total: number;
    withDatasets: number;
    withCriteria: number;
    byLevel: Record<number, number>;
  };
  timestamp: string;
}

export interface CriterionBreakdown {
  name: string;
  score: number;
  weight: number;
  threshold: number;
  passed: boolean;
}

export interface EvaluationSampleResult {
  sampleId: string;
  description: string;
  status: string;
  overallScore: number;
  durationMs: number;
  error?: string;
}

export interface EvaluationResult {
  skillId: string;
  skillName: string;
  skillVersion: string;
  datasetName: string;
  sampleCount: number;
  timestamp: string;
  overallScore: number;
  passThreshold: number;
  passed: boolean;
  criterionBreakdown: CriterionBreakdown[];
  samples: EvaluationSampleResult[];
  errors: string[];
  durationMs: number;
}

export interface ApiEvalResponse {
  type: "single" | "batch";
  level?: number | string;
  markdown: string;
  result: EvaluationResult | BatchEvalResult;
  timestamp: string;
}

export interface BatchEvalResult {
  timestamp: string;
  totalSkills: number;
  passed: number;
  failed: number;
  errored: number;
  overallPassRate: number;
  results: EvaluationResult[];
  durationMs: number;
}
