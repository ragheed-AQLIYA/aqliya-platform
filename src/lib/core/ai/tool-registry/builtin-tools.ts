import type { ToolDefinition } from "@/lib/kernel/contracts/tool-registry";

export const BUILTIN_TOOLS: ToolDefinition[] = [
  {
    id: "platform.search",
    name: "Platform Search",
    nameAr: "بحث المنصة",
    description: "Search across platform resources (engagements, decisions, evidence)",
    descriptionAr: "البحث عبر موارد المنصة (التدقيق، القرارات، الأدلة)",
    category: "platform",
    version: "1.0.0",
    parameters: [
      { name: "query", type: "string", description: "Search query", required: true },
      { name: "resourceTypes", type: "array", description: "Filter by resource types", required: false },
      { name: "limit", type: "number", description: "Max results", required: false, defaultValue: 10 },
    ],
    requiredRoles: ["admin", "manager", "operator", "reviewer", "analyst"],
    requiredPermissions: [],
    timeoutMs: 30_000,
    maxRetries: 2,
    isEnabled: true,
  },
  {
    id: "platform.export",
    name: "Platform Export",
    nameAr: "تصدير المنصة",
    description: "Export data as PDF, XLSX, or CSV",
    descriptionAr: "تصدير البيانات كـ PDF أو XLSX أو CSV",
    category: "export",
    version: "1.0.0",
    parameters: [
      { name: "resourceType", type: "string", description: "Resource type to export", required: true },
      { name: "resourceId", type: "string", description: "Resource ID", required: true },
      { name: "format", type: "string", description: "Export format", required: true, enum: ["pdf", "xlsx", "csv"] },
    ],
    requiredRoles: ["admin", "manager", "operator"],
    requiredPermissions: [],
    timeoutMs: 60_000,
    maxRetries: 1,
    isEnabled: true,
  },
  {
    id: "ai.generate",
    name: "AI Generate",
    nameAr: "توليد الذكاء الاصطناعي",
    description: "Generate AI output with governance controls",
    descriptionAr: "توليد مخرجات ذكاء اصطناعي مع ضوابط الحوكمة",
    category: "ai",
    version: "1.0.0",
    parameters: [
      { name: "taskType", type: "string", description: "AI task type", required: true, enum: ["analysis", "generation", "review", "extraction", "classification"] },
      { name: "input", type: "string", description: "Task input", required: true },
      { name: "model", type: "string", description: "Preferred model", required: false },
    ],
    requiredRoles: ["admin", "manager", "operator", "reviewer"],
    requiredPermissions: [],
    timeoutMs: 120_000,
    maxRetries: 1,
    isEnabled: true,
  },
  {
    id: "platform.audit-log",
    name: "Audit Log Query",
    nameAr: "استعلام سجل التدقيق",
    description: "Query the platform audit trail",
    descriptionAr: "استعلام سجل التدقيق للمنصة",
    category: "audit",
    version: "1.0.0",
    parameters: [
      { name: "resourceType", type: "string", description: "Resource type filter", required: false },
      { name: "resourceId", type: "string", description: "Resource ID filter", required: false },
      { name: "fromDate", type: "string", description: "Start date (ISO)", required: false },
      { name: "toDate", type: "string", description: "End date (ISO)", required: false },
    ],
    requiredRoles: ["admin", "manager", "reviewer"],
    requiredPermissions: [],
    timeoutMs: 30_000,
    maxRetries: 1,
    isEnabled: true,
  },
  {
    id: "platform.notification",
    name: "Send Notification",
    nameAr: "إرسال إشعار",
    description: "Send a notification to platform users",
    descriptionAr: "إرسال إشعار لمستخدمي المنصة",
    category: "notification",
    version: "1.0.0",
    parameters: [
      { name: "recipientId", type: "string", description: "Recipient user ID", required: true },
      { name: "title", type: "string", description: "Notification title", required: true },
      { name: "body", type: "string", description: "Notification body", required: true },
      { name: "channel", type: "string", description: "Notification channel", required: false, enum: ["in_app", "email", "push"], defaultValue: "in_app" },
    ],
    requiredRoles: ["admin", "manager"],
    requiredPermissions: [],
    timeoutMs: 10_000,
    maxRetries: 2,
    isEnabled: true,
  },
];

export function registerBuiltinTools(registry: {
  register(tool: ToolDefinition): unknown;
}): void {
  for (const tool of BUILTIN_TOOLS) {
    registry.register(tool);
  }
}
