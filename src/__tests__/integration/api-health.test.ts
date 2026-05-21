import { describe, it, expect } from "@jest/globals";

describe("API Health Endpoint", () => {
  it("should have health API route defined", () => {
    const { GET } = require("@/app/api/health/route");
    expect(GET).toBeDefined();
  });
});
