describe("platform rate-limit factory", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it("defaults to the memory provider when RATE_LIMITER is unset", async () => {
    delete process.env.RATE_LIMITER;
    delete process.env.REDIS_URL;

    const { getRateLimiterProvider } = await import("../index");
    const provider = getRateLimiterProvider();

    expect(provider.type).toBe("memory");
  });

  it("keeps a singleton until resetRateLimiterProvider is called", async () => {
    delete process.env.RATE_LIMITER;
    delete process.env.REDIS_URL;

    const { getRateLimiterProvider, resetRateLimiterProvider } = await import(
      "../index"
    );

    const first = getRateLimiterProvider();
    const second = getRateLimiterProvider();
    expect(second).toBe(first);

    resetRateLimiterProvider();

    const third = getRateLimiterProvider();
    expect(third).not.toBe(first);
    expect(third.type).toBe("memory");
  });

  it("falls back to memory and warns when redis mode is configured without REDIS_URL", async () => {
    process.env.RATE_LIMITER = "redis";
    delete process.env.REDIS_URL;
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    const { getRateLimiterProvider } = await import("../index");
    const provider = getRateLimiterProvider();

    expect(provider.type).toBe("memory");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("RATE_LIMITER=redis but REDIS_URL is not set"),
    );
  });

  it("creates the redis provider when RATE_LIMITER and REDIS_URL are both set", async () => {
    process.env.RATE_LIMITER = "redis";
    process.env.REDIS_URL = "redis://localhost:6379";

    const { getRateLimiterProvider } = await import("../index");
    const provider = getRateLimiterProvider();

    expect(provider.type).toBe("redis");
  });
});
