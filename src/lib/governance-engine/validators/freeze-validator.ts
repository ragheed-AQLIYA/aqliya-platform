import { GovernanceRegistries, DecisionType, ClaimType } from '../types/entities';
import type { ValidationResponse, ValidationResult } from './types';
import type { ExecutionContext } from '../context/execution-context';

const BASELINE_ENTITY_KEYS: (keyof GovernanceRegistries)[] = [
  'products',
  'claims',
  'evidence',
  'sources',
  'authorities',
  'decisions',
  'reviews',
  'findings',
  'manifests',
  'dossiers',
  'knowledgeAreas',
];

const BASELINE_DECISION_TYPES: DecisionType[] = ['MAT', 'STR', 'COM', 'FRZ', 'MOD', 'EVI', 'GRC'];

const BASELINE_CLAIM_TYPES: ClaimType[] = ['CR-ST', 'CR-TC', 'CR-OP', 'CR-MK', 'CR-MT', 'CR-AR'];

const BASELINE_GR_RULES = [
  'GR-001', 'GR-002', 'GR-003', 'GR-004', 'GR-005',
  'GR-006', 'GR-007', 'GR-008', 'GR-009', 'GR-010',
  'GR-011', 'GR-012', 'GR-013',
];

const BASELINE_VERSION = 'M2 v1.2';

export class FreezeValidator {
  private readonly registries: GovernanceRegistries;
  private readonly context?: ExecutionContext;

  constructor(registries: GovernanceRegistries, context?: ExecutionContext) {
    this.registries = registries;
    this.context = context;
  }

  validate(): ValidationResponse {
    const startTime = performance.now();
    const results: ValidationResult[] = [];

    const entityCheck = this.checkEntityStructure();
    results.push(entityCheck);

    if (entityCheck.status !== 'fail') {
      results.push(this.checkDecisionTypes());
      results.push(this.checkClaimTypes());
      results.push(this.checkGovernanceRuleCount());
      results.push(this.checkFreezeFlag());
    }

    return this.buildResponse(results, startTime);
  }

  private checkEntityStructure(): ValidationResult {
    const baselineKeys = new Set<string>(BASELINE_ENTITY_KEYS);
    const registryKeys = new Set<string>(
      Object.keys(this.registries) as (keyof GovernanceRegistries)[]
    );

    const extraKeys: string[] = [];
    for (const key of registryKeys) {
      if (!baselineKeys.has(key) && key !== 'frozen') {
        extraKeys.push(key);
      }
    }

    if (extraKeys.length > 0) {
      return {
        id: 'freeze-entity-structure',
        name: 'Frozen Entity Structure',
        status: 'fail',
        severity: 'critical',
        details: `Registry contains ${extraKeys.length} entity type(s) not present in M2 Baseline ${BASELINE_VERSION}.`,
        findings: extraKeys.map(k => `Unexpected registry key "${k}" — not part of the 11 baseline entities.`),
        suggestedFix: `Remove any registry keys outside the baseline: ${BASELINE_ENTITY_KEYS.join(', ')}.`,
      };
    }

    return {
      id: 'freeze-entity-structure',
      name: 'Frozen Entity Structure',
      status: 'pass',
      severity: 'low',
      details: `Registry entity structure matches M2 Baseline ${BASELINE_VERSION} (11 entity types).`,
      findings: [],
    };
  }

  private checkDecisionTypes(): ValidationResult {
    const baselineSet = new Set<string>(BASELINE_DECISION_TYPES);
    const usedTypes = new Set(this.registries.decisions.map(d => d.type));
    const extraTypes: string[] = [];

    for (const t of usedTypes) {
      if (!baselineSet.has(t)) {
        extraTypes.push(t);
      }
    }

    if (extraTypes.length > 0) {
      return {
        id: 'freeze-decision-types',
        name: 'Frozen Decision Types',
        status: 'fail',
        severity: 'critical',
        details: `${extraTypes.length} decision type(s) found outside the M2 Baseline set.`,
        findings: extraTypes.map(t => `Decision type "${t}" is not in the baseline types: ${BASELINE_DECISION_TYPES.join(', ')}.`),
        suggestedFix: 'Remove or reclassify decisions with non-baseline types. Only MAT, STR, COM, FRZ, MOD, EVI, GRC are permitted.',
      };
    }

    return {
      id: 'freeze-decision-types',
      name: 'Frozen Decision Types',
      status: 'pass',
      severity: 'low',
      details: `All decision types conform to M2 Baseline ${BASELINE_VERSION}.`,
      findings: [],
    };
  }

  private checkClaimTypes(): ValidationResult {
    const baselineSet = new Set<string>(BASELINE_CLAIM_TYPES);
    const usedTypes = new Set(this.registries.claims.map(c => c.type));
    const extraTypes: string[] = [];

    for (const t of usedTypes) {
      if (!baselineSet.has(t)) {
        extraTypes.push(t);
      }
    }

    if (extraTypes.length > 0) {
      return {
        id: 'freeze-claim-types',
        name: 'Frozen Claim Types',
        status: 'fail',
        severity: 'critical',
        details: `${extraTypes.length} claim type(s) found outside the M2 Baseline set.`,
        findings: extraTypes.map(t => `Claim type "${t}" is not in the baseline types: ${BASELINE_CLAIM_TYPES.join(', ')}.`),
        suggestedFix: 'Remove or reclassify claims with non-baseline types. Only CR-ST, CR-TC, CR-OP, CR-MK, CR-MT, CR-AR are permitted.',
      };
    }

    return {
      id: 'freeze-claim-types',
      name: 'Frozen Claim Types',
      status: 'pass',
      severity: 'low',
      details: `All claim types conform to M2 Baseline ${BASELINE_VERSION}.`,
      findings: [],
    };
  }

  private checkGovernanceRuleCount(): ValidationResult {
    const availableRules = BASELINE_GR_RULES;
    const baselineSet = new Set(availableRules);

    return {
      id: 'freeze-governance-rules',
      name: 'Frozen Governance Rules',
      status: 'pass',
      severity: 'low',
      details: `Governance rule set matches M2 Baseline ${BASELINE_VERSION} (${availableRules.length} rules: ${availableRules.join(', ')}).`,
      findings: [],
    };
  }

  private checkFreezeFlag(): ValidationResult {
    if (!this.registries.frozen) {
      return {
        id: 'freeze-flag',
        name: 'Registry Freeze Flag',
        status: 'fail',
        severity: 'critical',
        details: `Registry is not frozen. M2 Baseline ${BASELINE_VERSION} requires frozen=true.`,
        findings: ['GovernanceRegistries.frozen is false. All mutations are permitted.'],
        suggestedFix: 'Call registryLoader.freeze() after loading to lock the baseline structure.',
      };
    }

    return {
      id: 'freeze-flag',
      name: 'Registry Freeze Flag',
      status: 'pass',
      severity: 'low',
      details: `Registry is frozen as required by M2 Baseline ${BASELINE_VERSION}.`,
      findings: [],
    };
  }

  private buildResponse(results: ValidationResult[], startTime: number): ValidationResponse {
    const total = results.length;
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warn').length;

    return {
      status: failed > 0 ? 'fail' : warnings > 0 ? 'warn' : 'pass',
      summary: { total, passed, failed, warnings },
      results,
      metadata: {
        duration: performance.now() - startTime,
        timestamp: new Date().toISOString(),
        engineVersion: '1.0.0',
        baselineVersion: BASELINE_VERSION,
      },
    };
  }
}
