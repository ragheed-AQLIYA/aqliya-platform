jest.mock("@/lib/observability/logger", () => ({
  createLogger: () => ({
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock("../db", () => ({}));

type CommonModule = typeof import("../services/common");

/**
 * Loads a fresh instance of the common module with the given
 * AUDIT_ALLOW_MOCK_FALLBACK env value. Uses jest.isolateModules so
 * the ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK constant is evaluated
 * against the env var we set.
 */
function loadCommon(envValue: string | undefined): CommonModule {
  const original = process.env.AUDIT_ALLOW_MOCK_FALLBACK;
  if (envValue === undefined) {
    delete process.env.AUDIT_ALLOW_MOCK_FALLBACK;
  } else {
    process.env.AUDIT_ALLOW_MOCK_FALLBACK = envValue;
  }

  let mod: CommonModule | undefined;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require("../services/common") as CommonModule;
  });

  if (original === undefined) {
    delete process.env.AUDIT_ALLOW_MOCK_FALLBACK;
  } else {
    process.env.AUDIT_ALLOW_MOCK_FALLBACK = original;
  }

  if (!mod) throw new Error("Failed to load common module");
  return mod;
}

describe("tryDb", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.AUDIT_ALLOW_MOCK_FALLBACK;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.AUDIT_ALLOW_MOCK_FALLBACK;
    } else {
      process.env.AUDIT_ALLOW_MOCK_FALLBACK = originalEnv;
    }
  });

  // ─── Happy path: dbFn succeeds ───

  it("calls dbFn when USE_DATABASE is true and no error", async () => {
    const { tryDb, isUsingMockData, _resetMockDataFlag } = loadCommon("false");
    _resetMockDataFlag();

    const dbFn = jest.fn().mockResolvedValue("db-result");
    const fallback = jest.fn().mockResolvedValue("mock-result");

    const result = await tryDb(fallback, dbFn, "test read");

    expect(result).toBe("db-result");
    expect(dbFn).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
    expect(isUsingMockData()).toBe(false);
  });

  // ─── Fallback path: dbFn throws, mock fallback enabled ───

  it("falls back to mock when ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK is true and dbFn throws", async () => {
    const { tryDb, isUsingMockData, _resetMockDataFlag } = loadCommon("true");
    _resetMockDataFlag();

    const dbFn = jest.fn().mockRejectedValue(new Error("DB connection failed"));
    const fallback = jest.fn().mockResolvedValue("mock-result");

    const result = await tryDb(fallback, dbFn, "test read");

    expect(result).toBe("mock-result");
    expect(dbFn).toHaveBeenCalledTimes(1);
    expect(fallback).toHaveBeenCalledTimes(1);
    expect(isUsingMockData()).toBe(true);
  });

  // ─── Error path: dbFn throws, mock fallback disabled ───

  it("throws when ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK is false and dbFn throws", async () => {
    const { tryDb, _resetMockDataFlag } = loadCommon("false");
    _resetMockDataFlag();

    const dbFn = jest.fn().mockRejectedValue(new Error("DB connection failed"));
    const fallback = jest.fn().mockResolvedValue("mock-result");

    await expect(tryDb(fallback, dbFn, "test read")).rejects.toThrow(
      /Mock fallback is disabled.*DB connection failed/,
    );
    expect(fallback).not.toHaveBeenCalled();
  });

  // ─── Mock data flag tracking ───

  it("isUsingMockData() returns true after mock fallback", async () => {
    const { tryDb, isUsingMockData, _resetMockDataFlag } = loadCommon("true");
    _resetMockDataFlag();

    expect(isUsingMockData()).toBe(false);

    const dbFn = jest.fn().mockRejectedValue(new Error("fail"));
    const fallback = jest.fn().mockResolvedValue("mock-data");

    await tryDb(fallback, dbFn, "test");

    expect(isUsingMockData()).toBe(true);
  });

  it("isUsingMockData() returns false before any fallback", async () => {
    const { isUsingMockData, _resetMockDataFlag } = loadCommon("false");
    _resetMockDataFlag();

    expect(isUsingMockData()).toBe(false);
  });

  it("_resetMockDataFlag() resets the flag", async () => {
    const { tryDb, isUsingMockData, _resetMockDataFlag } = loadCommon("true");

    // Trigger a mock fallback to set the flag
    const dbFn = jest.fn().mockRejectedValue(new Error("fail"));
    const fallback = jest.fn().mockResolvedValue("mock-data");
    await tryDb(fallback, dbFn, "test");

    expect(isUsingMockData()).toBe(true);

    _resetMockDataFlag();

    expect(isUsingMockData()).toBe(false);
  });
});
