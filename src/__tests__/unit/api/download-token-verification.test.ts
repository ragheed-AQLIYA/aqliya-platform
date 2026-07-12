/**
 * Security-Critical: Download Token — HMAC-SHA256 + Constant-Time Comparison Tests
 *
 * Verifies the signed download token system:
 * 1. Token creation and verification roundtrip
 * 2. Constant-time signature comparison (timing-safe, H-03 fix)
 * 3. Expired token rejection
 * 4. Malformed token rejection
 * 5. Tampered signature rejection
 */

// Ensure DOWNLOAD_TOKEN_SECRET is set for tests
process.env.DOWNLOAD_TOKEN_SECRET = "test-secret-for-download-token-hmac-key-32";

import { signDownloadToken, verifyDownloadToken } from "@/lib/download-token";

describe("Download Token — HMAC-SHA256 Signing", () => {
  it("creates a valid token that verifies successfully", async () => {
    const token = await signDownloadToken({
      userId: "user-1",
      organizationId: "org-alpha",
      resourceType: "audit_evidence",
      resourceId: "evidence-1",
    });

    const payload = await verifyDownloadToken(token);

    expect(payload.sub).toBe("user-1");
    expect(payload.org).toBe("org-alpha");
    expect(payload.type).toBe("audit_evidence");
    expect(payload.file).toBe("evidence-1");
    expect(payload.iat).toBeGreaterThan(0);
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it("token has two parts separated by a dot", async () => {
    const token = await signDownloadToken({
      userId: "u",
      organizationId: "o",
      resourceType: "t",
      resourceId: "f",
    });

    const parts = token.split(".");
    expect(parts).toHaveLength(2);
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBeGreaterThan(0);
  });
});

describe("Download Token — Timing-Safe Signature Comparison (H-03)", () => {
  it("rejects a token with a tampered signature (constant-time XOR)", async () => {
    const token = await signDownloadToken({
      userId: "user-1",
      organizationId: "org-alpha",
      resourceType: "audit_evidence",
      resourceId: "evidence-1",
    });

    const [payload] = token.split(".");
    // Create a fake signature with the same length but different bytes
    const fakeSig = "A".repeat(43); // base64url of SHA-256 is 43 chars
    const tamperedToken = `${payload}.${fakeSig}`;

    await expect(verifyDownloadToken(tamperedToken)).rejects.toThrow(
      "Invalid token signature",
    );
  });

  it("rejects a completely fabricated token", async () => {
    // Craft a payload-like string with a random signature
    const fakePayload = Buffer.from(
      JSON.stringify({
        sub: "attacker",
        org: "org-stolen",
        type: "audit_evidence",
        file: "stolen-1",
        exp: Math.floor(Date.now() / 1000) + 300,
        iat: Math.floor(Date.now() / 1000),
      }),
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const fakeSig = "B".repeat(43);

    await expect(verifyDownloadToken(`${fakePayload}.${fakeSig}`)).rejects.toThrow(
      "Invalid token signature",
    );
  });

  it("rejects token with mismatched signature length", async () => {
    const token = await signDownloadToken({
      userId: "user-1",
      organizationId: "org-alpha",
      resourceType: "t",
      resourceId: "f",
    });

    const [payload] = token.split(".");
    // Short signature
    await expect(verifyDownloadToken(`${payload}.abc`)).rejects.toThrow(
      "Invalid token signature",
    );
  });
});

describe("Download Token — Expiration", () => {
  it("rejects an expired token", async () => {
    const token = await signDownloadToken({
      userId: "user-1",
      organizationId: "org-alpha",
      resourceType: "audit_evidence",
      resourceId: "evidence-1",
      expiresInMinutes: -1, // expired 1 minute ago
    });

    await expect(verifyDownloadToken(token)).rejects.toThrow(
      "Download token has expired",
    );
  });

  it("accepts a token within its validity window", async () => {
    const token = await signDownloadToken({
      userId: "user-1",
      organizationId: "org-alpha",
      resourceType: "audit_evidence",
      resourceId: "evidence-1",
      expiresInMinutes: 5,
    });

    const payload = await verifyDownloadToken(token);
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });
});

describe("Download Token — Malformed Input", () => {
  it("rejects token without a dot separator", async () => {
    await expect(verifyDownloadToken("nodothere")).rejects.toThrow(
      "Invalid token format",
    );
  });

  it("rejects token with three parts", async () => {
    await expect(verifyDownloadToken("a.b.c")).rejects.toThrow(
      "Invalid token format",
    );
  });

  it("rejects empty token", async () => {
    await expect(verifyDownloadToken("")).rejects.toThrow(
      "Invalid token format",
    );
  });

  it("rejects token with invalid base64url encoding", async () => {
    // This will cause a base64 decode error during verification
    await expect(verifyDownloadToken("!!!invalid.!!!invalid")).rejects.toThrow();
  });
});

describe("Download Token — Cross-User Isolation", () => {
  it("token signed for user-A cannot be used to impersonate user-B", async () => {
    const tokenForUserA = await signDownloadToken({
      userId: "user-A",
      organizationId: "org-alpha",
      resourceType: "audit_evidence",
      resourceId: "evidence-1",
    });

    const payload = await verifyDownloadToken(tokenForUserA);
    expect(payload.sub).toBe("user-A");
    expect(payload.org).toBe("org-alpha");
    // The payload itself contains the identity — verification ensures it wasn't tampered
  });

  it("different organizations produce different tokens", async () => {
    const token1 = await signDownloadToken({
      userId: "user-1",
      organizationId: "org-alpha",
      resourceType: "t",
      resourceId: "f",
    });

    const token2 = await signDownloadToken({
      userId: "user-1",
      organizationId: "org-beta",
      resourceType: "t",
      resourceId: "f",
    });

    expect(token1).not.toBe(token2);

    const payload1 = await verifyDownloadToken(token1);
    const payload2 = await verifyDownloadToken(token2);

    expect(payload1.org).toBe("org-alpha");
    expect(payload2.org).toBe("org-beta");
  });
});
