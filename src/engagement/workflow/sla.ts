/** SLA per revision — each review cycle has independent SLA */
export type SLAStatus = "on_track" | "approaching" | "breached";

const SLA_RULES: Record<string, number> = {
  Fieldwork: 720, InReview: 120, Reporting: 240, SignOff: 120, // hours
};

export class EngagementSLA {
  private timers = new Map<string, { stage: string; revision: number; startedAt: string; maxHours: number }>();
  escalationLog: Array<{ dealId: string; stage: string; level: 1 | 2; status: SLAStatus; triggeredAt: string }> = [];

  startTimer(dealId: string, stage: string, revision: number, startedAt?: string) {
    const max = SLA_RULES[stage];
    if (!max) return;
    this.timers.set(`${dealId}-r${revision}`, { stage, revision, startedAt: startedAt ?? new Date().toISOString(), maxHours: max });
  }

  getStatus(dealId: string, revision: number): { status: SLAStatus; elapsed: number; remaining: number } | null {
    const t = this.timers.get(`${dealId}-r${revision}`);
    if (!t) return null;
    const elapsed = (Date.now() - new Date(t.startedAt).getTime()) / 3600000;
    const remaining = Math.max(0, t.maxHours - elapsed);
    const pct = elapsed / t.maxHours * 100;
    return { status: pct >= 100 ? "breached" : pct >= 75 ? "approaching" : "on_track", elapsed: Math.round(elapsed), remaining: Math.round(remaining) };
  }
}
