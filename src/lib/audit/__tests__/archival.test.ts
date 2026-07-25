import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    platformAuditLog: {
      deleteMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { archiveOldEvents, countEventsToArchive } from "../archival";

const mockedPrisma = jest.requireMock("@/lib/prisma").prisma as {
  platformAuditLog: {
    deleteMany: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
  };
};

const FIXED_NOW = new Date("2026-07-03T00:00:00.000Z");

describe("audit archival service", () => {
  let archiveDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    archiveDir = fs.mkdtempSync(path.join(os.tmpdir(), "aqliya-audit-archival-"));
    process.env.AUDIT_ARCHIVE_DIR = archiveDir;
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(FIXED_NOW);
    mockedPrisma.platformAuditLog.deleteMany.mockResolvedValue({ count: 0 });
    mockedPrisma.platformAuditLog.findMany.mockResolvedValue([]);
    mockedPrisma.platformAuditLog.count.mockResolvedValue(0);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.useRealTimers();
    fs.rmSync(archiveDir, { recursive: true, force: true });
  });

  it("counts archive candidates using the explicit retention window", async () => {
    mockedPrisma.platformAuditLog.count.mockResolvedValue(7);

    const result = await countEventsToArchive(30);

    expect(result).toBe(7);
    expect(mockedPrisma.platformAuditLog.count).toHaveBeenCalledWith({
      where: {
        productKey: "audit_os",
        createdAt: {
          lt: new Date("2026-06-03T00:00:00.000Z"),
        },
      },
    });
  });

  it("falls back to the default retention when the env value is invalid", async () => {
    process.env.AUDIT_RETENTION_DAYS = "not-a-number";
    mockedPrisma.platformAuditLog.count.mockResolvedValue(3);

    const result = await countEventsToArchive();

    expect(result).toBe(3);
    expect(mockedPrisma.platformAuditLog.count).toHaveBeenCalledWith({
      where: {
        productKey: "audit_os",
        createdAt: {
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
    expect(mockedPrisma.platformAuditLog.deleteMany).not.toHaveBeenCalled();
  });

  it("writes NDJSON entries and deletes archived records", async () => {
    mockedPrisma.platformAuditLog.findMany.mockResolvedValue([
      { id: "plat-1", sourceId: "event-1", action: "", actorId: "", actorName: "", targetType: "", targetId: "", beforeState: "", afterState: "", eventDescription: "", aiRelated: false, metadata: { engagementId: "" }, createdAt: new Date("2025-01-02T10:00:00.000Z") },
      { id: "plat-2", sourceId: "event-2", action: "", actorId: "", actorName: "", targetType: "", targetId: "", beforeState: "", afterState: "", eventDescription: "", aiRelated: false, metadata: { engagementId: "" }, createdAt: new Date("2025-01-03T11:30:00.000Z") },
    ]);
    mockedPrisma.platformAuditLog.deleteMany.mockResolvedValue({ count: 2 });

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
      id: "plat-1",
      timestamp: "2025-01-02T10:00:00.000Z",
      archivedAt: FIXED_NOW.toISOString(),
      metadata: { engagementId: "" },
    });
    expect(mockedPrisma.platformAuditLog.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["plat-1", "plat-2"] },
      },
    });
  });

  it("deletes archived records in batches of 500", async () => {
    const events = Array.from({ length: 501 }, (_, index) => ({
      id: `plat-${index + 1}`,
      sourceId: `event-${index + 1}`,
      action: "",
      actorId: "",
      actorName: "",
      targetType: "",
      targetId: "",
      beforeState: "",
      afterState: "",
      eventDescription: "",
      aiRelated: false,
      metadata: { engagementId: "", source: "unit-test" },
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
    }));

    mockedPrisma.platformAuditLog.findMany.mockResolvedValue(events);
    mockedPrisma.platformAuditLog.deleteMany
      .mockResolvedValueOnce({ count: 500 })
      .mockResolvedValueOnce({ count: 1 });

    const report = await archiveOldEvents(365);

    expect(report.eventsArchived).toBe(501);
    expect(report.eventsDeleted).toBe(501);
    expect(mockedPrisma.platformAuditLog.deleteMany).toHaveBeenCalledTimes(2);
    expect(
      mockedPrisma.platformAuditLog.deleteMany.mock.calls[0]?.[0]?.where?.id?.in,
    ).toHaveLength(500);
    expect(
      mockedPrisma.platformAuditLog.deleteMany.mock.calls[1]?.[0]?.where?.id?.in,
    ).toHaveLength(1);
  });

  it("clamps retention to minimum 1 day when zero or negative is passed", async () => {
    mockedPrisma.platformAuditLog.count.mockResolvedValue(99);

    const result = await countEventsToArchive(0);

    expect(result).toBe(99);
    expect(mockedPrisma.platformAuditLog.count).toHaveBeenCalledWith({
      where: {
        productKey: "audit_os",
        createdAt: {
          lt: new Date("2026-07-02T00:00:00.000Z"), // today - 1 day
        },
      },
    });
  });

  it("writes the archive file inside AUDIT_ARCHIVE_DIR", async () => {
    mockedPrisma.platformAuditLog.findMany.mockResolvedValue([
      { id: "plat-edge", sourceId: "event-edge", action: "", actorId: "", actorName: "", targetType: "", targetId: "", beforeState: "", afterState: "", eventDescription: "", aiRelated: false, metadata: { engagementId: "" }, createdAt: new Date("2025-01-01T00:00:00.000Z") },
    ]);
    mockedPrisma.platformAuditLog.deleteMany.mockResolvedValue({ count: 1 });

    const report = await archiveOldEvents(365);

    expect(path.dirname(report.archiveFile)).toBe(archiveDir);
    expect(report.archiveFile).toMatch(/audit-events-.*\.ndjson$/);
  });
});
