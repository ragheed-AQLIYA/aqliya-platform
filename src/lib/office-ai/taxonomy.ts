/**
 * Office AI Assistant — Task Taxonomy
 * 
 * Categorises tasks for better routing and intelligence.
 */

export const TASK_CATEGORIES = {
  summarization: {
    labelAr: "تلخيص",
    labelEn: "Summarization",
    taskTypes: ["summarize", "exec_summary", "meeting_notes"],
    defaultModel: "deterministic",
  },
  content_creation: {
    labelAr: "إنشاء محتوى",
    labelEn: "Content Creation",
    taskTypes: ["draft", "outline"],
    defaultModel: "cloud_ai",
  },
  analysis: {
    labelAr: "تحليل",
    labelEn: "Analysis",
    taskTypes: ["analyze"],
    defaultModel: "cloud_ai",
  },
} as const;

export type TaskCategory = keyof typeof TASK_CATEGORIES;

export function classifyTask(taskType: string): TaskCategory {
  const entries = Object.entries(TASK_CATEGORIES) as [TaskCategory, typeof TASK_CATEGORIES[TaskCategory]][];
  for (const [category, def] of entries) {
    if ((def.taskTypes as readonly string[]).includes(taskType)) return category;
  }
  return "analysis";
}

export function getCategoryLabel(taskType: string, locale: "ar" | "en" = "ar"): string {
  const cat = classifyTask(taskType);
  return locale === "ar" ? TASK_CATEGORIES[cat].labelAr : TASK_CATEGORIES[cat].labelEn;
}
