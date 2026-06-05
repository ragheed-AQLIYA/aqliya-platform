import {
  formatAsJson,
  formatAsSyslog,
  formatAsCef,
  formatAsSplunkHec,
} from "../formatters";

function makeMockEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-event-001",
    platformOrganizationId: "org-123",
    clientWorkspaceId: "ws-456",
    projectId: "proj-789",
    productKey: "audit_os",
    environment: "production",
    actorId: "user-001",
    actorType: "admin",
    actorEmail: "admin@test.com",
    actorName: "أحمد المنصوري",
    action: "engagement.created",
    targetType: "engagement",
    targetId: "eng-001",
    targetLabel: "Engagement Q1 2026",
    severity: "info",
    status: "success",
    sourceSystem: "audit-os",
    sourceModel: "Engagement",
    sourceId: "eng-001",
    requestId: "req-abc",
    sessionId: "sess-xyz",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    aiProvider: null,
    aiModel: null,
    aiPromptVersion: null,
    aiOutputReviewStatus: null,
    evidenceRefs: null,
    metadata: { description: "Test event" },
    createdAt: new Date("2026-06-05T12:00:00Z"),
    updatedAt: new Date("2026-06-05T12:00:00Z"),
    ...overrides,
  } as never;
}

describe("formatAsJson", () => {
  it("returns formatted JSON array", () => {
    const events = [makeMockEvent()];
    const result = formatAsJson(events);
    expect(result.format).toBe("json");
    expect(result.contentType).toBe("application/json");
    const parsed = JSON.parse(result.body);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].id).toBe("test-event-001");
    expect(parsed[0].actor.name).toBe("أحمد المنصوري");
    expect(parsed[0].timestamp).toBe("2026-06-05T12:00:00.000Z");
  });

  it("handles empty array", () => {
    const result = formatAsJson([]);
    expect(JSON.parse(result.body)).toEqual([]);
  });

  it("includes ai block when provider is present", () => {
    const events = [makeMockEvent({ aiProvider: "openai", aiModel: "gpt-4" })];
    const parsed = JSON.parse(formatAsJson(events).body);
    expect(parsed[0].ai).toBeDefined();
    expect(parsed[0].ai.provider).toBe("openai");
  });

  it("omits ai block when provider is null", () => {
    const events = [makeMockEvent({ aiProvider: null })];
    const parsed = JSON.parse(formatAsJson(events).body);
    expect(parsed[0].ai).toBeUndefined();
  });
});

describe("formatAsSyslog", () => {
  it("returns RFC 5424 formatted syslog messages", () => {
    const events = [makeMockEvent()];
    const result = formatAsSyslog(events);
    expect(result.format).toBe("syslog");
    expect(result.contentType).toBe("text/plain");
    expect(result.body).toContain("1 ");
    expect(result.body).toContain("AQLIYA");
    expect(result.body).toContain("engagement.created");
    expect(result.body).toContain("أحمد المنصوري");
  });

  it("uses correct priority for severity levels", () => {
    const info = formatAsSyslog([makeMockEvent({ severity: "info" })]);
    const warning = formatAsSyslog([makeMockEvent({ severity: "warning" })]);
    const error = formatAsSyslog([makeMockEvent({ severity: "error" })]);
    expect(info.body).toMatch(/<16>1/);
    expect(warning.body).toMatch(/<14>1/);
    expect(error.body).toMatch(/<12>1/);
  });
});

describe("formatAsCef", () => {
  it("returns ArcSight CEF formatted messages", () => {
    const events = [makeMockEvent()];
    const result = formatAsCef(events);
    expect(result.format).toBe("cef");
    expect(result.contentType).toBe("text/plain");
    expect(result.body).toContain("CEF:0|AQLIYA|Platform|1.0");
    expect(result.body).toContain("engagement.created");
    expect(result.body).toContain("act=");
    expect(result.body).toContain("cs1Label=productKey");
  });

  it("properly escapes special characters", () => {
    const events = [
      makeMockEvent({ action: "test|action=with\\special\nchars" }),
    ];
    const result = formatAsCef(events);
    expect(result.body).not.toContain("|test|action=with\\special\nchars");
  });

  it("includes ip when present", () => {
    const events = [makeMockEvent({ ipAddress: "10.0.0.1" })];
    const result = formatAsCef(events);
    expect(result.body).toContain("src=10.0.0.1");
  });
});

describe("formatAsSplunkHec", () => {
  it("returns Splunk HEC formatted JSON", () => {
    const events = [makeMockEvent()];
    const result = formatAsSplunkHec(events);
    expect(result.format).toBe("splunk-hec");
    expect(result.contentType).toBe("application/json");
    const parsed = JSON.parse(result.body);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].sourcetype).toBe("aqliya:audit:log");
    expect(parsed[0].event.action).toBe("engagement.created");
  });

  it("includes time as epoch seconds", () => {
    const date = new Date("2026-06-05T12:00:00Z");
    const events = [makeMockEvent({ createdAt: date })];
    const parsed = JSON.parse(formatAsSplunkHec(events).body);
    expect(parsed[0].time).toBe(Math.floor(date.getTime() / 1000));
  });
});
