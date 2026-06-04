import { describe, expect, it } from "@jest/globals";
import { buildExportMetadata } from "../production-export";

describe("buildExportMetadata", () => {
  it("includes trust disclaimer", () => {
    const meta = buildExportMetadata({
      exportedBy: "Tester",
      exportType: "contact_profile",
      organizationId: "org-1",
    });
    expect(meta.disclaimer).toContain("AI assists");
    expect(meta.organizationId).toBe("org-1");
    expect(meta.exportType).toBe("contact_profile");
  });

  it("defaults source to local-contact", () => {
    const meta = buildExportMetadata({
      exportedBy: "x",
      exportType: "json",
      organizationId: "o",
    });
    expect(meta.source).toBe("local-contact");
  });
});
