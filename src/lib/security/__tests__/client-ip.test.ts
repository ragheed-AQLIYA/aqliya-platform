import { getTrustedClientIp } from "@/lib/security/client-ip";

function headers(map: Record<string, string>) {
  return {
    get(name: string) {
      return map[name.toLowerCase()] ?? null;
    },
  };
}

describe("trusted client IP", () => {
  const previous = process.env.TRUST_PROXY;

  afterEach(() => {
    process.env.TRUST_PROXY = previous;
  });

  it("ignores forwarded headers when TRUST_PROXY is unset", () => {
    delete process.env.TRUST_PROXY;
    expect(
      getTrustedClientIp(
        headers({ "x-forwarded-for": "1.2.3.4", "x-real-ip": "5.6.7.8" }),
      ),
    ).toBe("anonymous");
  });

  it("uses the first X-Forwarded-For hop when TRUST_PROXY=true", () => {
    process.env.TRUST_PROXY = "true";
    expect(
      getTrustedClientIp(headers({ "x-forwarded-for": "192.168.1.1, 10.0.0.1" })),
    ).toBe("192.168.1.1");
  });
});
