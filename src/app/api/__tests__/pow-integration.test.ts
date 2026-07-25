/**
 * PoW Integration Tests
 *
 * Tests the proof-of-work flow end-to-end:
 * - GET /api/pow/challenge returns valid challenge
 * - POST /api/pilot-review enforces PoW (via Zod + verifyPow)
 * - POST /api/custom-product-submit enforces PoW (manual check + verifyPow)
 *
 * Route handlers are invoked directly (no HTTP server).
 * Rate limiter is mocked to avoid flaky tests.
 */

import { createHash } from "crypto";
import { GET } from "@/app/api/pow/challenge/route";
import { POST as pilotReviewPOST } from "@/app/api/pilot-review/route";
import { POST as customProductPOST } from "@/app/api/custom-product-submit/route";
import { solvePowChallenge } from "@/lib/security/__helpers__/pow-test-utils";

// ── Mocks ────────────────────────────────────────────────────────────────────

// Mock rate limiter to always allow — avoids Redis/memory flakiness
jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn().mockResolvedValue({
    allowed: true,
    remaining: 100,
    resetAt: Date.now() + 60_000,
  }),
  clientIpRateLimitKey: jest.fn().mockReturnValue("test:127.0.0.1"),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function makePostRequest(
  body: Record<string, unknown>,
  url = "http://localhost:3000/api/test",
): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(
  url = "http://localhost:3000/api/pow/challenge",
): Request {
  return new Request(url, { method: "GET" });
}

const VALID_PILOT_REVIEW_BODY = {
  name: "أحمد الشمري",
  email: "ahmed@example.com",
  organization: "شركة التقنية المتقدمة",
  useCase: "نظام مراجعة مالي ذكي",
  role: "مدير التقنية",
  productInterest: "AuditOS",
  interest: "تقليل وقت التدقيق",
  dataType: "بيانات مالية",
  currentWorkflow: "Excel وسجلات يدوية",
  goal: "أتمتة التدقيق",
};

const VALID_CUSTOM_PRODUCT_BODY = {
  orgName: "شركة النخبة",
  industry: "financial_services",
  orgSize: "50-200",
  country: "SA",
  systemCategory: "audit",
  challenges: ["slow_decisions", "manual_audit"],
  environment: ["cloud"],
  outcomes: ["automation"],
  intent: "pilot",
  contactName: "محمد العلي",
  contactRole: "الرئيس التنفيذي",
  contactEmail: "mohammed@elite.com",
  contactPhone: "+966501234567",
  notes: "نحتاج نظام مراجعة متكامل",
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/pow/challenge", () => {
  it("returns a valid challenge object", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
    expect(typeof data).toBe("object");
  });

  it("challenge has token, salt, difficulty, expiresAt", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.token).toBeDefined();
    expect(typeof data.token).toBe("string");
    expect(data.token.length).toBeGreaterThan(0);

    expect(data.salt).toBeDefined();
    expect(typeof data.salt).toBe("string");
    expect(data.salt.length).toBeGreaterThan(0);

    expect(data.difficulty).toBeDefined();
    expect(typeof data.difficulty).toBe("number");
    expect(data.difficulty).toBeGreaterThanOrEqual(1);
    expect(data.difficulty).toBeLessThanOrEqual(4);

    expect(data.expiresAt).toBeDefined();
    expect(typeof data.expiresAt).toBe("number");
    expect(data.expiresAt).toBeGreaterThan(Date.now());
  });

  it("each call produces a unique challenge", async () => {
    const res1 = await GET();
    const data1 = await res1.json();
    const res2 = await GET();
    const data2 = await res2.json();

    expect(data1.token).not.toBe(data2.token);
    expect(data1.salt).not.toBe(data2.salt);
  });
});

describe("POST /api/pilot-review — PoW enforcement", () => {
  // pilot-review uses Zod validation first: pow is a required nested object
  // with required token/nonce/hash. Missing pow → 400 (Zod), not 403 (PoW).

  it("returns 400 when PoW field is entirely missing (Zod catches it first)", async () => {
    const req = makePostRequest(VALID_PILOT_REVIEW_BODY);
    const response = await pilotReviewPOST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error).toBeDefined();
  });

  it("returns 403 with invalid PoW (wrong token)", async () => {
    const solution = solvePowChallenge(2);
    const req = makePostRequest({
      ...VALID_PILOT_REVIEW_BODY,
      pow: {
        token: "bogus-token-never-created",
        nonce: solution.nonce,
        hash: solution.hash,
      },
    });
    const response = await pilotReviewPOST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.ok).toBe(false);
  });

  it("returns 403 with invalid PoW (wrong hash)", async () => {
    const solution = solvePowChallenge(2);
    const req = makePostRequest({
      ...VALID_PILOT_REVIEW_BODY,
      pow: {
        token: solution.token,
        nonce: solution.nonce,
        hash:
          "000000000000000000000000000000000000000000000000000000000000dead",
      },
    });
    const response = await pilotReviewPOST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.ok).toBe(false);
  });

  it("returns 400 when PoW nonce is missing (Zod catches it first)", async () => {
    const req = makePostRequest({
      ...VALID_PILOT_REVIEW_BODY,
      pow: { token: "some-token", hash: "some-hash" },
    });
    const response = await pilotReviewPOST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
  });

  it("accepts valid PoW and returns 200", async () => {
    const solution = solvePowChallenge(2);
    const req = makePostRequest({
      ...VALID_PILOT_REVIEW_BODY,
      pow: {
        token: solution.token,
        nonce: solution.nonce,
        hash: solution.hash,
      },
    });
    const response = await pilotReviewPOST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("rejects replayed PoW (token consumed after first use)", async () => {
    const solution = solvePowChallenge(2);

    // First submission succeeds
    const req1 = makePostRequest({
      ...VALID_PILOT_REVIEW_BODY,
      pow: {
        token: solution.token,
        nonce: solution.nonce,
        hash: solution.hash,
      },
    });
    const res1 = await pilotReviewPOST(req1);
    expect(res1.status).toBe(200);

    // Replay with same token fails
    const req2 = makePostRequest({
      ...VALID_PILOT_REVIEW_BODY,
      email: "another@example.com",
      pow: {
        token: solution.token,
        nonce: solution.nonce,
        hash: solution.hash,
      },
    });
    const res2 = await pilotReviewPOST(req2);
    expect(res2.status).toBe(403);
  });
});

describe("POST /api/custom-product-submit — PoW enforcement", () => {
  // custom-product-submit checks pow fields manually before Zod validation,
  // so missing pow → 403 (PoW check) as expected.

  it("returns 403 without PoW", async () => {
    const req = makePostRequest(VALID_CUSTOM_PRODUCT_BODY);
    const response = await customProductPOST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toMatch(/proof-of-work|required|verification failed/i);
  });

  it("returns 403 with invalid PoW (wrong token)", async () => {
    const solution = solvePowChallenge(2);
    const req = makePostRequest({
      ...VALID_CUSTOM_PRODUCT_BODY,
      pow: {
        token: "fake-token-does-not-exist",
        nonce: solution.nonce,
        hash: solution.hash,
      },
    });
    const response = await customProductPOST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
  });

  it("returns 403 with invalid PoW (wrong hash)", async () => {
    const solution = solvePowChallenge(2);
    const req = makePostRequest({
      ...VALID_CUSTOM_PRODUCT_BODY,
      pow: {
        token: solution.token,
        nonce: solution.nonce,
        hash:
          "aaaabbbbccccddddeeee000011112222333344445555666677778888",
      },
    });
    const response = await customProductPOST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
  });

  it("returns 403 with PoW body missing hash field", async () => {
    const req = makePostRequest({
      ...VALID_CUSTOM_PRODUCT_BODY,
      pow: { token: "some-token", nonce: "123" },
    });
    const response = await customProductPOST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
  });

  it("accepts valid PoW and returns 200", async () => {
    const solution = solvePowChallenge(2);
    const req = makePostRequest({
      ...VALID_CUSTOM_PRODUCT_BODY,
      pow: {
        token: solution.token,
        nonce: solution.nonce,
        hash: solution.hash,
      },
    });
    const response = await customProductPOST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("rejects replayed PoW (token consumed after first use)", async () => {
    const solution = solvePowChallenge(2);

    // First submission succeeds
    const req1 = makePostRequest({
      ...VALID_CUSTOM_PRODUCT_BODY,
      pow: {
        token: solution.token,
        nonce: solution.nonce,
        hash: solution.hash,
      },
    });
    const res1 = await customProductPOST(req1);
    expect(res1.status).toBe(200);

    // Replay fails
    const req2 = makePostRequest({
      ...VALID_CUSTOM_PRODUCT_BODY,
      contactEmail: "different@example.com",
      pow: {
        token: solution.token,
        nonce: solution.nonce,
        hash: solution.hash,
      },
    });
    const res2 = await customProductPOST(req2);
    expect(res2.status).toBe(403);
  });
});

describe("PoW challenge → solve → verify full cycle", () => {
  it("round-trips through challenge creation, solving, and pilot-review", async () => {
    // 1. Get challenge from route
    const challengeResponse = await GET();
    const challenge = await challengeResponse.json();

    // 2. Solve the challenge
    const prefix = "0".repeat(challenge.difficulty);
    let nonce = 0;
    let hash = "";
    while (true) {
      hash = createHash("sha256")
        .update(`${challenge.token}${challenge.salt}${nonce}`)
        .digest("hex");
      if (hash.startsWith(prefix)) break;
      nonce++;
    }

    // 3. Verify the hash meets difficulty
    expect(hash).toMatch(new RegExp(`^${prefix}`));

    // 4. Submit to pilot-review with the solved PoW
    const solution = { token: challenge.token, nonce: String(nonce), hash };
    const req = makePostRequest({
      ...VALID_PILOT_REVIEW_BODY,
      pow: solution,
    });
    const response = await pilotReviewPOST(req);
    expect(response.status).toBe(200);
  });

  it("round-trips through challenge creation, solving, and custom-product-submit", async () => {
    const challengeResponse = await GET();
    const challenge = await challengeResponse.json();

    const prefix = "0".repeat(challenge.difficulty);
    let nonce = 0;
    let hash = "";
    while (true) {
      hash = createHash("sha256")
        .update(`${challenge.token}${challenge.salt}${nonce}`)
        .digest("hex");
      if (hash.startsWith(prefix)) break;
      nonce++;
    }

    const solution = { token: challenge.token, nonce: String(nonce), hash };
    const req = makePostRequest({
      ...VALID_CUSTOM_PRODUCT_BODY,
      pow: solution,
    });
    const response = await customProductPOST(req);
    expect(response.status).toBe(200);
  });
});
