import { describe, expect, it } from "@jest/globals";
import { getTemplate, getRegisteredTemplateKeys } from "../templates";

describe("notification templates", () => {
  it("returns bilingual template for audit_review_assigned", () => {
    const tpl = getTemplate("audit_review_assigned", {
      title: "Q1 Audit",
      clientName: "ACME Corp",
      assignedAt: "2026-06-01",
    });
    expect(tpl.arSubject).toContain("Q1 Audit");
    expect(tpl.enSubject).toContain("Q1 Audit");
    expect(tpl.arSubject).toContain("تم تعيينك");
    expect(tpl.enSubject).toContain("Audit Review Assigned");
    expect(tpl.actionUrl).toBeUndefined();
  });

  it("renders all registered templates without error", () => {
    const keys = getRegisteredTemplateKeys();
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      const tpl = getTemplate(key);
      expect(tpl.arSubject).toBeTruthy();
      expect(tpl.arBody).toBeTruthy();
      expect(tpl.enSubject).toBeTruthy();
      expect(tpl.enBody).toBeTruthy();
    }
  });

  it("preserves unfilled variables when vars are missing", () => {
    const tpl = getTemplate("audit_review_assigned");
    expect(tpl.arSubject).toContain("{{title}}");
  });

  it("provides actionUrl when variable is present", () => {
    const tpl = getTemplate("audit_review_assigned", {
      title: "Test",
      clientName: "C",
      assignedAt: "now",
      actionUrl: "https://app.aqliya.ai/audit/test",
    });
    expect(tpl.actionUrl).toBe("https://app.aqliya.ai/audit/test");
  });

  it("has Arabic-first content for localcontent templates", () => {
    const tpl = getTemplate("localcontent_review_routing", {
      projectName: "مشروع الاختبار",
      score: 45,
    });
    expect(tpl.enSubject).toContain("Review Routing");
    expect(tpl.arSubject).toContain("للمراجعة");
    expect(tpl.arBody).toContain("مشروع الاختبار");
  });

  it("has all expected product template keys", () => {
    const keys = getRegisteredTemplateKeys();
    const expectedProductPrefixes = ["audit_", "decision_", "localcontent_", "sales_", "workflowos_"];
    for (const prefix of expectedProductPrefixes) {
      expect(keys.some((k) => k.startsWith(prefix))).toBe(true);
    }
  });
});
