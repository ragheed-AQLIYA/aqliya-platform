/**
 * SLA Monitor — SPEC-01c §4
 *
 * Periodic SLA checker. Runs at configurable intervals.
 * Detects breaches, triggers escalations, records audit.
 */

import { SLATracker, type SLAStatusResult } from "./sla";
import type { SLAPolicy, SLASegment } from "./sla-policy";

export interface MonitorConfig {
  checkIntervalMs: number;
  consecutiveWarningBeforeEscalation: number;
  consecutiveBreachBeforeLevel2: number;
}

const DEFAULT_CONFIG: MonitorConfig = {
  checkIntervalMs: 60 * 60 * 1000, // 1 hour
  consecutiveWarningBeforeEscalation: 2,
  consecutiveBreachBeforeLevel2: 2,
};

export interface SLAMonitoringEvent {
  type: "warning" | "escalation_level1" | "escalation_level2" | "extreme_breach";
  dealId: string;
  stage: string;
  slaStatus: SLAStatusResult;
  policy: string;
  segment?: string;
  timestamp: string;
}

export class SLAMonitor {
  private consecutiveWarnings = new Map<string, number>();
  private consecutiveBreaches = new Map<string, number>();

  constructor(
    private readonly tracker: SLATracker,
    private readonly config: MonitorConfig = DEFAULT_CONFIG,
  ) {}

  /**
   * Check all tracked deals for SLA status.
   * Returns monitoring events for any breaches or warnings.
   */
  checkAll(policy: SLAPolicy, segment?: SLASegment | string): SLAMonitoringEvent[] {
    const events: SLAMonitoringEvent[] = [];

    for (const [dealId] of this.tracker.getTrackedDeals()) {
      const status = this.tracker.getStatus(dealId);
      if (!status) continue;

      const event = this.evaluateDeal(dealId, status, policy, segment);
      if (event) events.push(event);
    }

    return events;
  }

  private evaluateDeal(
    dealId: string,
    status: SLAStatusResult,
    policy: SLAPolicy,
    segment?: SLASegment | string,
  ): SLAMonitoringEvent | null {
    const now = new Date().toISOString();
    const base = { dealId, stage: status.stage, slaStatus: status, policy: policy.policyId, segment, timestamp: now };

    switch (status.status) {
      case "on_track":
        this.consecutiveWarnings.delete(dealId);
        this.consecutiveBreaches.delete(dealId);
        return null;

      case "approaching": {
        const count = (this.consecutiveWarnings.get(dealId) ?? 0) + 1;
        this.consecutiveWarnings.set(dealId, count);
        if (count >= this.config.consecutiveWarningBeforeEscalation) {
          return { type: "warning", ...base };
        }
        return null;
      }

      case "breached": {
        const count = (this.consecutiveBreaches.get(dealId) ?? 0) + 1;
        this.consecutiveBreaches.set(dealId, count);
        if (count >= this.config.consecutiveBreachBeforeLevel2) {
          return { type: "escalation_level2", ...base };
        }
        return { type: "escalation_level1", ...base };
      }

      case "extreme":
        return { type: "extreme_breach", ...base };

      default:
        return null;
    }
  }
}
