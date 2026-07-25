import { readFileSync } from "fs";
import { resolve } from "path";

const files = [
  { label: "decisions-crud/detail", path: resolve(__dirname, "../decisions-crud/detail.ts") },
  { label: "audit-engagement-actions", path: resolve(__dirname, "../audit-engagement-actions.ts") },
  { label: "localcontent-spend-actions", path: resolve(__dirname, "../localcontent-spend-actions.ts") },
  { label: "sales-dashboard-actions", path: resolve(__dirname, "../sales-dashboard-actions.ts") },
  {
    label: "export route",
    path: resolve(__dirname, "../../app/api/audit/engagements/[engagementId]/exports/[format]/route.ts"),
  },
];

describe("structured logger wired in critical files", () => {
  it.each(files)("$label imports createLogger from observability/logger", ({ path: filePath }) => {
    const content = readFileSync(filePath, "utf-8");
    expect(content).toContain('from "@/lib/observability/logger"');
    expect(content).toContain("createLogger");
  });

  it.each(files)("$label uses logger.error in catch blocks", ({ path: filePath }) => {
    const content = readFileSync(filePath, "utf-8");
    expect(content).toMatch(/logger\.error\(/);
  });
});
