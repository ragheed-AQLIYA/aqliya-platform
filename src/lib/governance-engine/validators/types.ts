export interface ValidationResponse {
  status: 'pass' | 'fail' | 'warn' | 'error';
  summary: { total: number; passed: number; failed: number; warnings: number };
  results: ValidationResult[];
  metadata: { duration: number; timestamp: string; engineVersion: string; baselineVersion: string };
}

export interface ValidationResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'error';
  severity: 'critical' | 'high' | 'medium' | 'low';
  details: string;
  findings: string[];
  suggestedFix?: string;

  // v2 fields (optional, populated by GovernanceValidator)
  ruleId?: string;             // e.g. "GR-001"
  executionTime?: number;      // ms
  errorCode?: string;          // machine-readable error code
  documentationLink?: string;  // link to relevant documentation
  validatorVersion?: string;   // version of this validator
}
