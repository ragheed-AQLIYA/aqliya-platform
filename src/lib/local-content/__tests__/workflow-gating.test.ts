import {
  isTransitionAllowed,
  evaluateWorkbookTabGate,
  evaluateAllTabGates,
  isWorkbookEditable,
  isTabAccessible,
  buildGateContext,
  requireTransition,
  type WorkbookGateContext,
} from "../workflow-gating";

describe("Workflow transitions", () => {
  describe("isTransitionAllowed", () => {
    it("should allow draft → populated", () => {
      expect(isTransitionAllowed("draft", "populated")).toEqual({
        allowed: true,
      });
    });

    it("should allow draft → partial", () => {
      expect(isTransitionAllowed("draft", "partial")).toEqual({
        allowed: true,
      });
    });

    it("should allow populated → partial", () => {
      expect(isTransitionAllowed("populated", "partial")).toEqual({
        allowed: true,
      });
    });

    it("should allow populated → complete", () => {
      expect(isTransitionAllowed("populated", "complete")).toEqual({
        allowed: true,
      });
    });

    it("should allow populated → populated (re-populate)", () => {
      expect(isTransitionAllowed("populated", "populated")).toEqual({
        allowed: true,
      });
    });

    it("should allow partial → complete", () => {
      expect(isTransitionAllowed("partial", "complete")).toEqual({
        allowed: true,
      });
    });

    it("should allow partial → populated (re-import)", () => {
      expect(isTransitionAllowed("partial", "populated")).toEqual({
        allowed: true,
      });
    });

    it("should allow complete → exported", () => {
      expect(isTransitionAllowed("complete", "exported")).toEqual({
        allowed: true,
      });
    });

    it("should allow complete → populated (re-import)", () => {
      expect(isTransitionAllowed("complete", "populated")).toEqual({
        allowed: true,
      });
    });

    it("should block exported → anything", () => {
      expect(isTransitionAllowed("exported", "draft")).toEqual({
        allowed: false,
        reason: expect.any(String),
      });
      expect(isTransitionAllowed("exported", "populated")).toEqual({
        allowed: false,
        reason: expect.any(String),
      });
      expect(isTransitionAllowed("exported", "complete")).toEqual({
        allowed: false,
        reason: expect.any(String),
      });
    });

    it("should block draft → complete (must go through partial)", () => {
      const result = isTransitionAllowed("draft", "complete");
      expect(result.allowed).toBe(false);
    });

    it("should block draft → exported (not allowed)", () => {
      expect(isTransitionAllowed("draft", "exported")).toEqual({
        allowed: false,
        reason: expect.any(String),
      });
    });

    it("should block populated → draft (no going back)", () => {
      expect(isTransitionAllowed("populated", "draft")).toEqual({
        allowed: false,
        reason: expect.any(String),
      });
    });

    it("should block partial → draft (no going back)", () => {
      expect(isTransitionAllowed("partial", "draft")).toEqual({
        allowed: false,
        reason: expect.any(String),
      });
    });

    it("should block complete → partial (no regression)", () => {
      expect(isTransitionAllowed("complete", "partial")).toEqual({
        allowed: false,
        reason: expect.any(String),
      });
    });

    it("should allow same-status transition (no-op)", () => {
      expect(isTransitionAllowed("draft", "draft")).toEqual({
        allowed: true,
      });
      expect(isTransitionAllowed("exported", "exported")).toEqual({
        allowed: true,
      });
    });
  });

  describe("requireTransition", () => {
    it("should not throw for allowed transitions", () => {
      expect(() => requireTransition("draft", "populated")).not.toThrow();
    });

    it("should throw for disallowed transitions", () => {
      expect(() => requireTransition("exported", "draft")).toThrow();
    });
  });
});

describe("Tab gates", () => {
  const draftCtx: WorkbookGateContext = {
    status: "draft",
    totalLines: 22,
    autoFilledLines: 0,
    missingLines: 22,
    completionPct: 0,
  };

  const partialCtx: WorkbookGateContext = {
    status: "partial",
    totalLines: 22,
    autoFilledLines: 9,
    missingLines: 13,
    completionPct: 41,
  };

  const completeCtx: WorkbookGateContext = {
    status: "complete",
    totalLines: 22,
    autoFilledLines: 22,
    missingLines: 0,
    completionPct: 100,
  };

  const exportedCtx: WorkbookGateContext = {
    status: "exported",
    totalLines: 22,
    autoFilledLines: 22,
    missingLines: 0,
    completionPct: 100,
  };

  describe("lines tab", () => {
    it("should always be accessible", () => {
      expect(isTabAccessible("lines", draftCtx)).toBe(true);
      expect(isTabAccessible("lines", exportedCtx)).toBe(true);
    });
  });

  describe("missing data tab", () => {
    it("should be locked for draft", () => {
      expect(isTabAccessible("missing", draftCtx)).toBe(false);
    });

    it("should be unlocked for populated/partial/complete", () => {
      expect(isTabAccessible("missing", partialCtx)).toBe(true);
      expect(isTabAccessible("missing", completeCtx)).toBe(true);
    });
  });

  describe("data requests tab", () => {
    it("should be locked for draft", () => {
      expect(isTabAccessible("requests", draftCtx)).toBe(false);
    });

    it("should be unlocked after draft", () => {
      expect(isTabAccessible("requests", partialCtx)).toBe(true);
    });
  });

  describe("TB import gate", () => {
    it("should be unlocked for non-exported", () => {
      expect(isTabAccessible("tb-import", draftCtx)).toBe(true);
      expect(isTabAccessible("tb-import", partialCtx)).toBe(true);
      expect(isTabAccessible("tb-import", completeCtx)).toBe(true);
    });

    it("should be locked for exported", () => {
      expect(isTabAccessible("tb-import", exportedCtx)).toBe(false);
    });
  });

  describe("export gate", () => {
    it("should be locked when not 100% complete", () => {
      expect(isTabAccessible("export", draftCtx)).toBe(false);
      expect(isTabAccessible("export", partialCtx)).toBe(false);
    });

    it("should be unlocked when 100% complete", () => {
      expect(isTabAccessible("export", completeCtx)).toBe(true);
    });

    it("should be locked when already exported", () => {
      expect(isTabAccessible("export", exportedCtx)).toBe(false);
    });
  });

  describe("manual edit gate", () => {
    it("should be unlocked for non-exported statuses", () => {
      expect(isTabAccessible("manual-edit", draftCtx)).toBe(true);
      expect(isTabAccessible("manual-edit", partialCtx)).toBe(true);
      expect(isTabAccessible("manual-edit", completeCtx)).toBe(true);
    });

    it("should be locked for exported", () => {
      expect(isTabAccessible("manual-edit", exportedCtx)).toBe(false);
    });
  });
});

describe("isWorkbookEditable", () => {
  it("should return true for non-exported statuses", () => {
    expect(isWorkbookEditable("draft")).toBe(true);
    expect(isWorkbookEditable("populated")).toBe(true);
    expect(isWorkbookEditable("partial")).toBe(true);
    expect(isWorkbookEditable("complete")).toBe(true);
  });

  it("should return false for exported", () => {
    expect(isWorkbookEditable("exported")).toBe(false);
  });
});

describe("buildGateContext", () => {
  it("should extract context from workbook record", () => {
    const workbook = {
      id: "wb-1",
      status: "partial",
      totalLines: 22,
      autoFilledLines: 9,
      missingLines: 13,
      completionPct: 41,
    } as any;

    const ctx = buildGateContext(workbook);
    expect(ctx.status).toBe("partial");
    expect(ctx.completionPct).toBe(41);
    expect(ctx.missingLines).toBe(13);
  });
});

describe("evaluateAllTabGates", () => {
  it("should return results for all gates", () => {
    const ctx: WorkbookGateContext = {
      status: "draft",
      totalLines: 22,
      autoFilledLines: 0,
      missingLines: 22,
      completionPct: 0,
    };
    const results = evaluateAllTabGates(ctx);
    expect(Object.keys(results).length).toBeGreaterThan(0);
    // Draft should have missing, requests, export locked
    expect(results["missing"]?.locked).toBe(true);
    expect(results["export"]?.locked).toBe(true);
    // Lines and tb-import should be unlocked
    expect(results["lines"]?.locked).toBe(false);
    expect(results["tb-import"]?.locked).toBe(false);
  });
});
