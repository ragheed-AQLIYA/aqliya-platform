import "server-only"

export interface PromptTemplate {
  id: string
  name: string
  systemPrompt: string
  expectedMinLength: number
  requiredKeywords?: string[]
  forbiddenPatterns?: RegExp[]
  requiredFields?: string[]
}

// Audit-specific prompt templates
export const AUDIT_TEMPLATES: Record<string, PromptTemplate> = {
  "audit-summary": {
    id: "audit-summary",
    name: "ملخص التدقيق",
    systemPrompt: `أنت مساعد تدقيق مالي متخصص. قم بتحليل ميزان المراجعة المقدم وقدم:
1. ملخص تنفيذي للنتائج الرئيسية
2. تحليل النسب المالية الرئيسية
3. الملاحظات والتوصيات
4. مستويات المخاطر`,
    expectedMinLength: 500,
    requiredKeywords: ["ملخص", "توصيات", "مخاطر"],
    requiredFields: ["summary", "ratios", "findings", "recommendations"],
  },

  "finding-analysis": {
    id: "finding-analysis",
    name: "تحليل النتائج",
    systemPrompt: `قم بتحليل نتيجة التدقيق المقدمة وقدم:
1. وصف النتيجة
2. السبب الجذري
3. الأثر المالي
4. التوصية
5. مستوى الأولوية`,
    expectedMinLength: 300,
    requiredFields: ["description", "rootCause", "impact", "recommendation"],
  },

  "classification": {
    id: "classification",
    name: "تصنيف المحتوى المحلي",
    systemPrompt: `قم بتصنيف البند المقدم حسب المحتوى المحلي:
1. فئة التصنيف
2. نسبة المحتوى المحلي
3. الأدلة المطلوبة
4. الملاحظات`,
    expectedMinLength: 200,
    requiredKeywords: ["تصنيف", "محتوى محلي"],
    forbiddenPatterns: [/غير متاح/i, /لا يوجد معلومات/i],
  },
}

export function getPromptTemplate(id: string): PromptTemplate | undefined {
  return AUDIT_TEMPLATES[id]
}

export function listPromptTemplates(): PromptTemplate[] {
  return Object.values(AUDIT_TEMPLATES)
}
