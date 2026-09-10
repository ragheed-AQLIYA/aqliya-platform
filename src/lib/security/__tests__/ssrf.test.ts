import { assertSafeOutboundUrl, isBlockedIpAddress } from "@/lib/security/ssrf";

describe("SSRF protection", () => {
  describe("isBlockedIpAddress", () => {
    it("blocks loopback", () => {
      expect(isBlockedIpAddress("127.0.0.1")).toBe(true);
      expect(isBlockedIpAddress("::1")).toBe(true);
    });

    it("blocks RFC1918 private IPv4", () => {
      expect(isBlockedIpAddress("10.0.0.1")).toBe(true);
      expect(isBlockedIpAddress("192.168.1.1")).toBe(true);
      expect(isBlockedIpAddress("172.16.0.1")).toBe(true);
    });

    it("blocks link-local and cloud metadata", () => {
      expect(isBlockedIpAddress("169.254.169.254")).toBe(true);
      expect(isBlockedIpAddress("169.254.1.1")).toBe(true);
    });

    it("blocks unique-local IPv6", () => {
      expect(isBlockedIpAddress("fd12:3456:789a::1")).toBe(true);
      expect(isBlockedIpAddress("fc00::1")).toBe(true);
      expect(isBlockedIpAddress("fe80::1")).toBe(true);
    });

    it("blocks IPv4-mapped IPv6 private addresses", () => {
      expect(isBlockedIpAddress("::ffff:10.0.0.1")).toBe(true);
      expect(isBlockedIpAddress("::ffff:c0a8:0001")).toBe(true);
    });

    it("allows public IPv4", () => {
      expect(isBlockedIpAddress("8.8.8.8")).toBe(false);
      expect(isBlockedIpAddress("1.1.1.1")).toBe(false);
    });
  });

  describe("assertSafeOutboundUrl", () => {
    it("rejects localhost hostnames", async () => {
      await expect(assertSafeOutboundUrl("http://localhost/admin")).rejects.toThrow(
        "URL host is not allowed",
      );
    });

    it("rejects loopback IPs", async () => {
      await expect(assertSafeOutboundUrl("http://127.0.0.1/secret")).rejects.toThrow(
        "blocked address",
      );
    });

    it("rejects cloud metadata endpoints", async () => {
      await expect(
        assertSafeOutboundUrl("http://169.254.169.254/latest/meta-data/"),
      ).rejects.toThrow(/not allowed|blocked address/);
    });

    it("rejects RFC1918 addresses", async () => {
      await expect(assertSafeOutboundUrl("https://10.1.2.3/internal")).rejects.toThrow(
        "blocked address",
      );
      await expect(assertSafeOutboundUrl("http://192.168.0.10/hook")).rejects.toThrow(
        "blocked address",
      );
    });

    it("rejects non-http protocols", async () => {
      await expect(assertSafeOutboundUrl("file:///etc/passwd")).rejects.toThrow(
        "URL protocol not allowed",
      );
    });

    it("rejects internal DNS suffixes", async () => {
      await expect(assertSafeOutboundUrl("https://db.internal/query")).rejects.toThrow(
        "URL host is not allowed",
      );
    });

    it("rejects metadata.google.internal", async () => {
      await expect(
        assertSafeOutboundUrl("http://metadata.google.internal/computeMetadata/v1/"),
      ).rejects.toThrow("URL host is not allowed");
    });

    it("allows a public https URL by IP", async () => {
      const parsed = await assertSafeOutboundUrl("https://8.8.8.8/resolve");
      expect(parsed.protocol).toBe("https:");
    });
  });
});
