import { safeJsonParse, safeError } from "@/lib/utils";

describe("safeJsonParse", () => {
  it("parses valid JSON", () => {
    const result = safeJsonParse('{"name":"test","count":5}', {
      name: "fallback",
      count: 0,
    });
    expect(result).toEqual({ name: "test", count: 5 });
  });

  it("returns fallback for invalid JSON", () => {
    const fallback = { description: "fallback" };
    const result = safeJsonParse("not-json{", fallback);
    expect(result).toBe(fallback);
  });

  it("returns fallback for empty string", () => {
    const fallback = { title: "empty" };
    const result = safeJsonParse("", fallback);
    expect(result).toBe(fallback);
  });

  it("handles null gracefully", () => {
    const fallback = { value: 0 };
    const result = safeJsonParse("null", fallback);
    expect(result).toBeNull();
  });

  it("handles nested objects", () => {
    const result = safeJsonParse('{"a":{"b":[1,2,3]}}', { a: { b: [] } });
    expect(result).toEqual({ a: { b: [1, 2, 3] } });
  });

  it("handles undefined input", () => {
    const fallback = { safe: true };
    const result = safeJsonParse(undefined as unknown as string, fallback);
    expect(result).toBe(fallback);
  });
});

describe("safeError", () => {
  it("returns message from Error object", () => {
    expect(safeError(new Error("test error"))).toBe("test error");
  });

  it("returns string directly", () => {
    expect(safeError("plain string")).toBe("plain string");
  });

  it("returns default for unknown types", () => {
    expect(safeError(null)).toBe("An unexpected error occurred");
    expect(safeError(undefined)).toBe("An unexpected error occurred");
    expect(safeError(42)).toBe("An unexpected error occurred");
  });

  it("returns default for empty Error", () => {
    expect(safeError(new Error(""))).toBe("");
  });
});
