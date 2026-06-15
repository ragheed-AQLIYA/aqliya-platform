import { isMindMapEnabled } from "@/lib/audit/reporting-graph";

describe("isMindMapEnabled", () => {
  const prev = process.env.FF_AUDIT_MIND_MAP;

  afterEach(() => {
    if (prev === undefined) delete process.env.FF_AUDIT_MIND_MAP;
    else process.env.FF_AUDIT_MIND_MAP = prev;
  });

  it("defaults off", () => {
    delete process.env.FF_AUDIT_MIND_MAP;
    expect(isMindMapEnabled()).toBe(false);
  });

  it("respects env override", () => {
    process.env.FF_AUDIT_MIND_MAP = "true";
    expect(isMindMapEnabled()).toBe(true);
  });
});
