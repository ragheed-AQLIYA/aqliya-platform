import { describe, expect, it } from "@jest/globals";
import { verifySignature } from "../webhook-channel";

describe("webhook channel - verifySignature", () => {
  it("returns true for valid signature", () => {
    const payload = JSON.stringify({ event: "test", data: { foo: "bar" } });
    const secret = "my-secret-key";

    // Simulate what the sender would do:
    const { createHmac } = require("crypto");
    const expectedSig = createHmac("sha256", secret).update(payload).digest("hex");

    const result = verifySignature(payload, expectedSig, secret);
    expect(result).toBe(true);
  });

  it("returns false for invalid signature", () => {
    const payload = JSON.stringify({ event: "test" });
    const result = verifySignature(payload, "invalid-signature", "secret");
    expect(result).toBe(false);
  });

  it("returns false for tampered payload", () => {
    const secret = "my-secret";
    const { createHmac } = require("crypto");
    const validSig = createHmac("sha256", secret)
      .update(JSON.stringify({ event: "original" }))
      .digest("hex");

    const result = verifySignature(
      JSON.stringify({ event: "tampered" }),
      validSig,
      secret,
    );
    expect(result).toBe(false);
  });

  it("handles empty secret gracefully", () => {
    const result = verifySignature("payload", "sig", "");
    expect(result).toBe(false);
  });

  it("handles empty payload gracefully", () => {
    const result = verifySignature("", "sig", "secret");
    expect(result).toBe(false);
  });
});

describe("webhook channel - retry logic", () => {
  it("exports sendWebhook function", async () => {
    const { sendWebhook } = await import("../webhook-channel");
    expect(typeof sendWebhook).toBe("function");
  });

  it("returns failure for unreachable URL without throwing", async () => {
    const { sendWebhook } = await import("../webhook-channel");
    const result = await sendWebhook(
      "http://127.0.0.1:1/nonexistent",
      "test_event",
      { some: "data" },
    );
    expect(result.success).toBe(false);
    expect(result.channel).toBe("webhook");
    expect(result.error).toBeTruthy();
  });
});
