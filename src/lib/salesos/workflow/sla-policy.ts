/**
 * SLA Policy Engine — SPEC-01c §4.1
 *
 * Policy-based SLA configuration with segment-aware rules.
 * Enterprise, SMB, and Government segments have different SLA expectations.
 *
 * Default policy: "salesos-sla-v1"
 */

export interface SLAPolicy {
  policyId: string;
  name: string;
  rules: SLARule[];
  defaultRule: SLARule;
}

export interface SLARule {
  stageName: string;
  maxDurationHours: number;
  warningThresholdPercent: number;
  escalateThresholdPercent: number;
  extremeThresholdPercent: number;
  applicableSegments?: string[];
}

export type SLASegment = "enterprise" | "smb" | "government";

// ─── Default policy ───

export const DEFAULT_SLA_POLICY: SLAPolicy = {
  policyId: "salesos-sla-v1",
  name: "SalesOS Default SLA",
  rules: [
    { stageName: "Draft", maxDurationHours: 168, warningThresholdPercent: 75, escalateThresholdPercent: 100, extremeThresholdPercent: 200 },
    { stageName: "In Review", maxDurationHours: 72, warningThresholdPercent: 75, escalateThresholdPercent: 100, extremeThresholdPercent: 200 },
  ],
  defaultRule: { stageName: "*", maxDurationHours: 336, warningThresholdPercent: 75, escalateThresholdPercent: 100, extremeThresholdPercent: 200 },
};

// ─── Segment-aware policy ───

export const SEGMENT_SLA_POLICIES: Record<SLASegment, SLAPolicy> = {
  enterprise: {
    policyId: "salesos-sla-enterprise",
    name: "Enterprise SLA",
    rules: [
      { stageName: "Draft", maxDurationHours: 168, warningThresholdPercent: 75, escalateThresholdPercent: 100, extremeThresholdPercent: 200 },
      { stageName: "In Review", maxDurationHours: 48, warningThresholdPercent: 75, escalateThresholdPercent: 100, extremeThresholdPercent: 200 },
    ],
    defaultRule: { stageName: "*", maxDurationHours: 168, warningThresholdPercent: 75, escalateThresholdPercent: 100, extremeThresholdPercent: 200 },
  },
  smb: {
    policyId: "salesos-sla-smb",
    name: "SMB SLA",
    rules: [
      { stageName: "Draft", maxDurationHours: 336, warningThresholdPercent: 75, escalateThresholdPercent: 100, extremeThresholdPercent: 200 },
      { stageName: "In Review", maxDurationHours: 96, warningThresholdPercent: 75, escalateThresholdPercent: 100, extremeThresholdPercent: 200 },
    ],
    defaultRule: { stageName: "*", maxDurationHours: 504, warningThresholdPercent: 75, escalateThresholdPercent: 100, extremeThresholdPercent: 200 },
  },
  government: {
    policyId: "salesos-sla-government",
    name: "Government SLA",
    rules: [
      { stageName: "Draft", maxDurationHours: 720, warningThresholdPercent: 50, escalateThresholdPercent: 80, extremeThresholdPercent: 150 },
      { stageName: "In Review", maxDurationHours: 240, warningThresholdPercent: 50, escalateThresholdPercent: 80, extremeThresholdPercent: 150 },
    ],
    defaultRule: { stageName: "*", maxDurationHours: 720, warningThresholdPercent: 50, escalateThresholdPercent: 80, extremeThresholdPercent: 150 },
  },
};

// ─── Resolve policy for segment ───

export function resolvePolicy(segment?: SLASegment | string): SLAPolicy {
  if (!segment) return DEFAULT_SLA_POLICY;
  const policy = SEGMENT_SLA_POLICIES[segment as SLASegment];
  return policy ?? DEFAULT_SLA_POLICY;
}

export function getRule(policy: SLAPolicy, stageName: string): SLARule {
  return policy.rules.find((r) => r.stageName === stageName) ?? policy.defaultRule;
}
