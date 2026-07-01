/** End-to-end Engagement flow tests — workflow, SLA, audit, concurrency */
import { Engagement } from "../domain/engagement";
import { ConcurrencyError, BusinessRuleError } from "../domain/errors";
import { EngagementWorkflow } from "../workflow/orchestrator";
import { EngagementSLA } from "../workflow/sla";
import { EngagementAudit } from "../audit";

describe("EngagementWorkflow", () => {
  const wf = new EngagementWorkflow();

  test("forward transitions: Proposal → Archived", async () => {
    let e = Engagement.create({ clientId: "c1", period: "FY2026", organizationId: "org1", createdById: "u1" });
    e = Engagement.reconstitute({ ...e.toJSON(), id: "e1" });
    e = await wf.transition(e, "accept", "u2");
    expect(e.status).toBe("Accepted");
    e = await wf.transition(e, "plan", "u2");
    expect(e.status).toBe("Planning");
    e = await wf.transition(e, "assess_risk", "u2");
    expect(e.status).toBe("RiskAssessment");
    e = await wf.transition(e, "start_fieldwork", "u2");
    expect(e.status).toBe("Fieldwork");
    e = await wf.transition(e, "submit_review", "u2");
    expect(e.status).toBe("InReview");
    e = await wf.transition(e, "approve_review", "u3");
    expect(e.status).toBe("Reporting");
    const eWithQR = Engagement.reconstitute({ ...e.toJSON(), qualityReviewCompleted: true });
    e = await wf.transition(eWithQR, "report", "u3");
    expect(e.status).toBe("SignOff");
    e = await wf.transition(e, "sign_off", "u4");
    expect(e.status).toBe("Archived");
  });

  test("non-linear loop: InReview → Fieldwork → InReview", async () => {
    let e = Engagement.create({ clientId: "c1", period: "FY2026", organizationId: "org1", createdById: "u1" });
    e = Engagement.reconstitute({ ...e.toJSON(), id: "e2" });
    e = await wf.transition(e, "start_fieldwork", "u1");
    e = await wf.transition(e, "submit_review", "u1");
    const revBefore = e.revisionCycles.length;
    e = await wf.transition(e, "return_to_fieldwork", "u2", { reason: "Findings need revision" });
    expect(e.status).toBe("Fieldwork");
    expect(e.revisionCycles.length).toBe(revBefore + 1);
    e = await wf.transition(e, "submit_review", "u1");
    expect(e.status).toBe("InReview");
  });

  test("return requires reason", async () => {
    let e = Engagement.create({ clientId: "c1", period: "FY2026", organizationId: "org1", createdById: "u1" });
    e = Engagement.reconstitute({ ...e.toJSON(), id: "e3" });
    e = await wf.transition(e, "start_fieldwork", "u1");
    e = await wf.transition(e, "submit_review", "u1");
    await expect(wf.transition(e, "return_to_fieldwork", "u2", {}))
      .rejects.toThrow(BusinessRuleError);
  });

  test("invalid action rejected", async () => {
    const e = Engagement.create({ clientId: "c1", period: "FY2026", organizationId: "org1", createdById: "u1" });
    await expect(wf.transition(e, "invalid", "u1")).rejects.toThrow(BusinessRuleError);
  });
});

describe("EngagementSLA", () => {
  test("Fieldwork SLA: starts on entry, on_track initially", () => {
    const sla = new EngagementSLA();
    sla.startTimer("e1", "Fieldwork", 1);
    const s = sla.getStatus("e1", 1);
    expect(s).not.toBeNull();
    expect(s!.status).toBe("on_track");
  });

  test("InReview SLA per revision cycle", () => {
    const sla = new EngagementSLA();
    sla.startTimer("e1", "InReview", 1);
    sla.startTimer("e1", "InReview", 2);
    const s1 = sla.getStatus("e1", 1);
    const s2 = sla.getStatus("e1", 2);
    expect(s1).not.toBeNull();
    expect(s2).not.toBeNull();
  });
});

describe("EngagementAudit", () => {
  test("records and lists entries", () => {
    const audit = new EngagementAudit();
    audit.record({ action: "engagement.created", actorId: "u1", targetType: "Engagement", targetId: "e1", organizationId: "org1" });
    audit.record({ action: "engagement.transitioned", actorId: "u1", targetType: "Engagement", targetId: "e1", organizationId: "org1" });
    expect(audit.list("org1")).toHaveLength(2);
  });

  test("immutable: returned entry equals original", () => {
    const audit = new EngagementAudit();
    const e = audit.record({ action: "test", actorId: "u1", targetType: "Engagement", targetId: "e1", organizationId: "org1" });
    const before = JSON.stringify(e);
    (e as any).action = "modified";
    const fromList = audit.list("org1")[0];
    expect(JSON.stringify(fromList)).toBe(before);
  });
});
