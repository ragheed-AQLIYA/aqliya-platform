/**
 * SLA Tracker — SPEC-01c §4
 *
 * Tracks SLA status per stage. Timers start on stage entry and reset on exit.
 * Escalation notifies — never auto-transitions.
 */

export type SLAStatus = "on_track" | "approaching" | "breached" | "extreme";

export interface SLAConfig {
  stageName: string;
  maxDurationHours: number;
  warningThresholdPercent: number;
}

export const DEFAULT_SLA_CONFIGS: SLAConfig[] = [
  { stageName: "Draft", maxDurationHours: 168, warningThresholdPercent: 75 },   // 7 days
  { stageName: "In Review", maxDurationHours: 72, warningThresholdPercent: 75 }, // 3 days
];

export interface SLAEntry {
  dealId: string;
  stageName: string;
  enteredAt: string;     // ISO timestamp
  maxDurationHours: number;
}

export interface SLAStatusResult {
  status: SLAStatus;
  stage: string;
  enteredAt: string;
  maxDurationHours: number;
  elapsedHours: number;
  remainingHours: number;
  breachedAt?: string;
}

export interface EscalationEvent {
  dealId: string;
  stage: string;
  level: 1 | 2;
  status: SLAStatus;
  triggeredAt: string;
}

export class SLATracker {
  private entries: Map<string, SLAEntry> = new Map();
  public escalationLog: EscalationEvent[] = [];

  startTimer(dealId: string, stageName: string, enteredAt?: string): void {
    const config = DEFAULT_SLA_CONFIGS.find((c) => c.stageName === stageName);
    if (!config) return; // No SLA for this stage

    this.entries.set(dealId, {
      dealId,
      stageName,
      enteredAt: enteredAt ?? new Date().toISOString(),
      maxDurationHours: config.maxDurationHours,
    });
  }

  stopTimer(dealId: string): void {
    this.entries.delete(dealId);
  }

  getStatus(dealId: string, now?: Date): SLAStatusResult | null {
    const entry = this.entries.get(dealId);
    if (!entry) return null;

    const config = DEFAULT_SLA_CONFIGS.find((c) => c.stageName === entry.stageName);
    if (!config) return null;

    const current = now ?? new Date();
    const entered = new Date(entry.enteredAt);
    const elapsedHours = (current.getTime() - entered.getTime()) / (1000 * 60 * 60);
    const remainingHours = Math.max(0, entry.maxDurationHours - elapsedHours);
    const usedPercent = (elapsedHours / entry.maxDurationHours) * 100;

    let status: SLAStatus;
    if (usedPercent >= 200) status = "extreme";
    else if (usedPercent >= 100) status = "breached";
    else if (usedPercent >= config.warningThresholdPercent) status = "approaching";
    else status = "on_track";

    return {
      status,
      stage: entry.stageName,
      enteredAt: entry.enteredAt,
      maxDurationHours: entry.maxDurationHours,
      elapsedHours: Math.round(elapsedHours * 10) / 10,
      remainingHours: Math.round(remainingHours * 10) / 10,
      breachedAt: status === "breached" || status === "extreme"
        ? new Date(entered.getTime() + entry.maxDurationHours * 60 * 60 * 1000).toISOString()
        : undefined,
    };
  }

  getTrackedDeals(): Map<string, SLAEntry> {
    return this.entries;
  }

  escalate(dealId: string, now?: Date): EscalationEvent | null {
    const status = this.getStatus(dealId, now);
    if (!status) return null;

    let level: 1 | 2 = 1;
    if (status.status === "extreme") level = 2;

    if (status.status === "approaching" || status.status === "breached" || status.status === "extreme") {
      const event: EscalationEvent = {
        dealId,
        stage: status.stage,
        level,
        status: status.status,
        triggeredAt: (now ?? new Date()).toISOString(),
      };
      this.escalationLog.push(event);
      return event;
    }
    return null;
  }
}
