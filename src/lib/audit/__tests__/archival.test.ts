import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditEvent: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { archiveOldEvents, countEventsToArchive } from "../archival";

const mockedPrisma = jest.requireMock("@/lib/prisma").prisma as {
  auditEvent: {
    findMany: jest.Mock;
    deleteMany: jest.Mock;
    count: jest.Mock;
  };
};

const FIXED_NOW = new Date("2026-07-03T00:00:00.000Z");

function buildEvent(id: string, timestamp: string) {
  return {
    id,
    engagementId: "eng-1",
    eventType: "engagement.updated",
    actorId: "user-1",
    actorName: "Partner One",
    actorRole: "partner",
    targetType: "engagement",
    targetId: "eng-1",
    previousState: "draft",
    newState: "approved",
    description: `Updated ${id}`,
    aiRelated: false,
    metadata: { source: "unit-test", id },
    timestamp: new Date(timestamp),
  };
}

describe("audit archival service", () => {
  let archiveDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    archiveDir = fs.mkdtempSync(path.join(os.tmpdir(), "aqliya-audit-archival-"));
    process.env.AUDIT_ARCHIVE_DIR = archiveDir;
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(FIXED_NOW);
    mockedPrisma.auditEvent.deleteMany.mockResolvedValue({ count: 0 });
    mockedPrisma.auditEvent.findMany.mockResolvedValue([]);
    mockedPrisma.auditEvent.count.mockResolvedValue(0);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.useRealTimers();
    fs.rmSync(archiveDir, { recursive: true, force: true });
  });

  it("counts archive candidates using the explicit retention window", async () => {
    mockedPrisma.auditEvent.count.mockResolvedValue(7);

    const result = await countEventsToArchive(30);

    expect(result).toBe(7);
    expect(mockedPrisma.auditEvent.count).toHaveBeenCalledWith({
      where: {
        timestamp: {
          lt: new Date("2026-06-03T00:00:00.000Z"),
        },
      },
    });
  });

  it("falls back to the default retention when the env value is invalid", async () => {
    process.env.AUDIT_RETENTION_DAYS = "not-a-number";
    mockedPrisma.auditEvent.count.mockResolvedValue(3);

    const result = await countEventsToArchive();

    expect(result).toBe(3);
    expect(mockedPrisma.auditEvent.count).toHaveBeenCalledWith({
      where: {
        timestamp: {
          lt: new Date("2025-07-03T00:00:00.000Z"),
        },
      },
    });
  });

  it("returns a zero-work report when no old events are found", async () => {
    const report = await archiveOldEvents(90);

    expect(report.eventsArchived).toBe(0);
    expect(report.eventsDeleted).toBe(0);
    expect(report.retentionDays).toBe(90);
    expect(path.dirname(report.archiveFile)).toBe(archiveDir);
    expect(fs.existsSync(report.archiveFile)).toBe(false);
    expect(mockedPrisma.auditEvent.deleteMany).not.toHaveBeenCalled();
  });

  it("writes NDJSON entries and deletes archived records", async () => {
    mockedPrisma.auditEvent.findMany.mockResolvedValue([
      buildEvent("event-1", "2025-01-02T10:00:00.000Z"),
      buildEvent("event-2", "2025-01-03T11:30:00.000Z"),
    ]);
    mockedPrisma.auditEvent.deleteMany.mockResolvedValue({ count: 2 });

    const report = await archiveOldEvents(180);

    expect(report.eventsArchived).toBe(2);
    expect(report.eventsDeleted).toBe(2);
    expect(fs.existsSync(report.archiveFile)).toBe(true);

    const lines = fs
      .readFileSync(report.archiveFile, "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as Record<string, unknown>);

    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({
      id: "event-1",
      timestamp: "2025-01-02T10:00:00.000Z",
      archivedAt: FIXED_NOW.toISOString(),
      metadata: { source: "unit-test", id: "event-1" },
    });
    expect(mockedPrisma.auditEvent.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["event-1", "event-2"] },
      },
    });
  });

  it("deletes archived records in batches of 500", async () => {
    const events = Array.from({ length: 501 }, (_, index) =>
      buildEvent(`event-${index + 1}`, "2025-01-01T00:00:00.000Z"),
    );

    mockedPrisma.auditEvent.findMany.mockResolvedValue(events);
    mockedPrisma.auditEvent.deleteMany
      .mockResolvedValueOnce({ count: 500 })
      .mockResolvedValueOnce({ count: 1 });

    const report = await archiveOldEvents(365);

    expect(report.eventsArchived).toBe(501);
    expect(report.eventsDeleted).toBe(501);
    expect(mockedPrisma.auditEvent.deleteMany).toHaveBeenCalledTimes(2);
    expect(
      mockedPrisma.auditEvent.deleteMany.mock.calls[0]?.[0]?.where?.id?.in,
    ).toHaveLength(500);
    expect(
      mockedPrisma.auditEvent.deleteMany.mock.calls[1]?.[0]?.where?.id?.in,
    ).toHaveLength(1);
  });
});
