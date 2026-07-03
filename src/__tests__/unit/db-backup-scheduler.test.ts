const execSyncMock = jest.fn();
const existsSyncMock = jest.fn();
const mkdirSyncMock = jest.fn();
const readdirSyncMock = jest.fn();
const unlinkSyncMock = jest.fn();
const dotenvConfigMock = jest.fn();

jest.mock("child_process", () => ({
  execSync: execSyncMock,
}));

jest.mock("fs", () => ({
  existsSync: existsSyncMock,
  mkdirSync: mkdirSyncMock,
  readdirSync: readdirSyncMock,
  unlinkSync: unlinkSyncMock,
}));

jest.mock("dotenv", () => ({
  config: dotenvConfigMock,
}));

describe("db-backup-scheduler", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.clearAllMocks();
    jest.resetModules();
    existsSyncMock.mockReturnValue(true);
    readdirSyncMock.mockReturnValue([]);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it("falls back to safe defaults when env values are invalid", async () => {
    process.env.BACKUP_INTERVAL_MS = "not-a-number";
    process.env.BACKUP_MAX_FILES = "0";
    delete process.env.BACKUP_DIR;

    const scheduler = await import("../../../scripts/platform/db-backup-scheduler.ts");
    const config = scheduler.getBackupSchedulerConfig();

    expect(dotenvConfigMock).toHaveBeenCalled();
    expect(config.intervalMs).toBe(3_600_000);
    expect(config.maxBackups).toBe(30);
    expect(config.backupDir).toMatch(/backups$/);
  });

  it("runs backups with the resolved BACKUP_DIR and returns true on success", async () => {
    process.env.BACKUP_DIR = "../../custom-backups";

    const scheduler = await import("../../../scripts/platform/db-backup-scheduler.ts");
    const config = scheduler.getBackupSchedulerConfig();

    execSyncMock.mockReturnValue(Buffer.from("ok"));

    const result = scheduler.runBackup(config);

    expect(result).toBe(true);
    expect(execSyncMock).toHaveBeenCalledWith(
      "npm run db:backup",
      expect.objectContaining({
        stdio: "inherit",
        timeout: 300_000,
        env: expect.objectContaining({
          BACKUP_DIR: config.backupDir,
        }),
      }),
    );
  });

  it("prunes only overflow backup dump files", async () => {
    process.env.BACKUP_MAX_FILES = "2";
    readdirSyncMock.mockReturnValue([
      "ignore.txt",
      "aqliya_backup_2026-01-01.dump",
      "backup_2026-01-02.dump",
      "backup_2026-01-03.dump",
      "aqliya_backup_2026-01-04.dump",
    ]);

    const scheduler = await import("../../../scripts/platform/db-backup-scheduler.ts");
    const config = scheduler.getBackupSchedulerConfig();

    scheduler.cleanOldBackups(config);

    expect(unlinkSyncMock).toHaveBeenCalledTimes(2);
    expect(unlinkSyncMock.mock.calls[0]?.[0]).toMatch(/backup_2026-01-02\.dump$/);
    expect(unlinkSyncMock.mock.calls[1]?.[0]).toMatch(/aqliya_backup_2026-01-01\.dump$/);
  });

  it("creates the backup directory and exits zero in single-run mode", async () => {
    existsSyncMock.mockReturnValue(false);
    execSyncMock.mockReturnValue(Buffer.from("ok"));
    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);

    const scheduler = await import("../../../scripts/platform/db-backup-scheduler.ts");
    scheduler.main(["node", "db-backup-scheduler.ts"]);

    expect(mkdirSyncMock).toHaveBeenCalledWith(expect.stringMatching(/backups$/), {
      recursive: true,
    });
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("starts timer mode without exiting immediately", async () => {
    process.env.BACKUP_INTERVAL_MS = "60000";
    execSyncMock.mockReturnValue(Buffer.from("ok"));
    const setIntervalSpy = jest
      .spyOn(global, "setInterval")
      .mockImplementation((() => 123 as unknown as NodeJS.Timeout) as never);
    const processOnSpy = jest.spyOn(process, "on").mockReturnThis();
    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as never);

    const scheduler = await import("../../../scripts/platform/db-backup-scheduler.ts");
    scheduler.main(["node", "db-backup-scheduler.ts", "--timer"]);

    expect(execSyncMock).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000);
    expect(processOnSpy).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function));
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
