import { AUDIT_OS_EVENTS, publishAuditOSEvent } from "../events/audit-events";
import { LOCAL_CONTENT_OS_EVENTS, publishLocalContentOSEvent } from "../events/lcos-events";
import { CROSS_PRODUCT_EVENTS, publishCrossProductEvent } from "../events/cross-product-events";

describe("AuditOS Domain Events", () => {
  test("AUDIT_OS_EVENTS has all 8 events", () => {
    expect(Object.keys(AUDIT_OS_EVENTS)).toHaveLength(8);
    expect(AUDIT_OS_EVENTS.ENGAGEMENT_CREATED).toBe("engagement.created");
    expect(AUDIT_OS_EVENTS.ENGAGEMENT_STATUS_CHANGED).toBe("engagement.status_changed");
    expect(AUDIT_OS_EVENTS.ENGAGEMENT_PUBLISHED).toBe("engagement.published");
    expect(AUDIT_OS_EVENTS.FINDING_CREATED).toBe("finding.created");
    expect(AUDIT_OS_EVENTS.FINDING_STATUS_CHANGED).toBe("finding.status_changed");
    expect(AUDIT_OS_EVENTS.EVIDENCE_UPLOADED).toBe("evidence.uploaded");
    expect(AUDIT_OS_EVENTS.EVIDENCE_LINKED).toBe("evidence.linked");
    expect(AUDIT_OS_EVENTS.REVIEW_COMPLETED).toBe("review.completed");
  });

  test("publishAuditOSEvent creates correct event shape", () => {
    const event = publishAuditOSEvent(AUDIT_OS_EVENTS.ENGAGEMENT_CREATED, {
      actorId: "user-1",
      organizationId: "org-1",
      resourceId: "eng-1",
      resourceType: "engagement",
      metadata: { engagementName: "Test Audit" },
    });

    expect(event.productSlug).toBe("audit-os");
    expect(event.domain).toBe("audit");
    expect(event.action).toBe("engagement.created");
    expect(event.actorId).toBe("user-1");
    expect(event.organizationId).toBe("org-1");
    expect(event.resourceId).toBe("eng-1");
    expect(event.resourceType).toBe("engagement");
    expect(event.metadata).toEqual({ engagementName: "Test Audit" });
  });
});

describe("LocalContentOS Domain Events", () => {
  test("LOCAL_CONTENT_OS_EVENTS has all 6 events", () => {
    expect(Object.keys(LOCAL_CONTENT_OS_EVENTS)).toHaveLength(6);
    expect(LOCAL_CONTENT_OS_EVENTS.PROJECT_CREATED).toBe("project.created");
    expect(LOCAL_CONTENT_OS_EVENTS.PROJECT_STATUS_CHANGED).toBe("project.status_changed");
    expect(LOCAL_CONTENT_OS_EVENTS.CLASSIFICATION_COMPLETED).toBe("classification.completed");
    expect(LOCAL_CONTENT_OS_EVENTS.SPEND_IMPORTED).toBe("spend.imported");
    expect(LOCAL_CONTENT_OS_EVENTS.REPORT_GENERATED).toBe("report.generated");
    expect(LOCAL_CONTENT_OS_EVENTS.FINDING_CREATED).toBe("finding.created");
  });

  test("publishLocalContentOSEvent creates correct event shape", () => {
    const event = publishLocalContentOSEvent(LOCAL_CONTENT_OS_EVENTS.PROJECT_CREATED, {
      actorId: "user-1",
      organizationId: "org-1",
      resourceId: "proj-1",
      resourceType: "LocalContentProject",
      metadata: { projectName: "Test Project" },
    });

    expect(event.productSlug).toBe("local-content-os");
    expect(event.domain).toBe("lc");
    expect(event.action).toBe("project.created");
    expect(event.actorId).toBe("user-1");
    expect(event.metadata).toEqual({ projectName: "Test Project" });
  });
});

describe("Cross-Product Events", () => {
  test("CROSS_PRODUCT_EVENTS has all 5 events", () => {
    expect(Object.keys(CROSS_PRODUCT_EVENTS)).toHaveLength(5);
    expect(CROSS_PRODUCT_EVENTS.EVIDENCE_UPLOADED).toBe("evidence.uploaded");
    expect(CROSS_PRODUCT_EVENTS.EVIDENCE_LINKED).toBe("evidence.linked");
    expect(CROSS_PRODUCT_EVENTS.EVIDENCE_STATUS_CHANGED).toBe("evidence.status_changed");
    expect(CROSS_PRODUCT_EVENTS.KNOWLEDGE_PATTERN_RECORDED).toBe("knowledge.pattern_recorded");
    expect(CROSS_PRODUCT_EVENTS.AI_OUTPUT_GENERATED).toBe("ai.output_generated");
  });

  test("publishCrossProductEvent creates correct event shape", () => {
    const event = publishCrossProductEvent("evidence", CROSS_PRODUCT_EVENTS.EVIDENCE_UPLOADED, {
      productSlug: "audit-os",
      actorId: "user-1",
      organizationId: "org-1",
      resourceId: "ev-1",
      resourceType: "evidence",
      metadata: { sourceProduct: "audit-os", targetProduct: "local-content-os" },
    });

    expect(event.productSlug).toBe("audit-os");
    expect(event.domain).toBe("evidence");
    expect(event.action).toBe("evidence.uploaded");
    expect(event.metadata).toEqual({ sourceProduct: "audit-os", targetProduct: "local-content-os" });
  });
});
