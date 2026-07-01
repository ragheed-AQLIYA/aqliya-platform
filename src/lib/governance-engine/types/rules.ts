// Governance Engine — Rule Types
// M2 Baseline v1.2 (Frozen) — GR-001 to GR-013

export type RuleId = `GR-${string}`;

export type RuleStatus = 'pass' | 'fail' | 'warn' | 'error';

export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';

export type RulePhase = 'structural' | 'identity' | 'integrity' | 'pattern' | 'historical';

export interface RuleDefinition {
  id: RuleId;
  name: string;
  phase: RulePhase;
  severity: RuleSeverity;
  blocking: boolean;
  description: string;
}

export interface RuleResult {
  ruleId: RuleId;
  name: string;
  status: RuleStatus;
  severity: RuleSeverity;
  blocking: boolean;
  findings: string[];
  duration: number;
  details?: string;
}

export interface RuleEngineReport {
  rules: RuleResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    blocked: boolean;
    blockReasons: string[];
  };
  timestamp: string;
  duration: number;
  baselineVersion: string;
}

export const RULES: Record<string, RuleDefinition> = {
  'GR-001': { id: 'GR-001', name: 'Immutable IDs Rule', phase: 'structural', severity: 'critical', blocking: true, description: 'CLM/EV/SRC/AUTH/DEC IDs never change' },
  'GR-002': { id: 'GR-002', name: 'Derived Artifacts Rule', phase: 'structural', severity: 'high', blocking: true, description: 'Manifests and Dossiers never manually edited' },
  'GR-003': { id: 'GR-003', name: 'Evidence Manifest Rule', phase: 'identity', severity: 'critical', blocking: true, description: 'No MAT decision without Evidence Manifest' },
  'GR-004': { id: 'GR-004', name: 'Glossary Precision Rule', phase: 'identity', severity: 'medium', blocking: false, description: 'Ban ambiguous status terms' },
  'GR-005': { id: 'GR-005', name: 'Three-tier Review Separation', phase: 'identity', severity: 'critical', blocking: true, description: 'No single agent produces evidence and decides L-levels' },
  'GR-006': { id: 'GR-006', name: 'Decision Preconditions Rule', phase: 'integrity', severity: 'critical', blocking: true, description: 'All 6 preconditions met before MAT decision' },
  'GR-007': { id: 'GR-007', name: 'Evidence Independence Check', phase: 'integrity', severity: 'high', blocking: true, description: 'No circular evidence chains' },
  'GR-008': { id: 'GR-008', name: 'Shared Evidence Canonicalization', phase: 'integrity', severity: 'high', blocking: true, description: 'Shared capabilities have one canonical EV' },
  'GR-009': { id: 'GR-009', name: 'Capability Evidence Canonicalization', phase: 'pattern', severity: 'high', blocking: true, description: 'Engine products: 1 EV per capability, maturity = derived' },
  'GR-010': { id: 'GR-010', name: 'Marginal Knowledge Efficiency', phase: 'pattern', severity: 'medium', blocking: false, description: 'Evidence cost decreases as products scale' },
  'GR-011': { id: 'GR-011', name: 'Knowledge Quality Preservation', phase: 'pattern', severity: 'high', blocking: false, description: 'Reducing new EV must not reduce quality' },
  'GR-012': { id: 'GR-012', name: 'Historical Consistency Preservation', phase: 'historical', severity: 'high', blocking: true, description: 'SupersededBy chain preserved, no deleted history' },
  'GR-013': { id: 'GR-013', name: 'Governance Conflict Preservation', phase: 'historical', severity: 'critical', blocking: true, description: 'Conflicting facts across dimensions preserved independently' },
};
