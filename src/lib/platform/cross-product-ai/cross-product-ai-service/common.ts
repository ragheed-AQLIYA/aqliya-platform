import "server-only"

export const RISK_REQUIRES_REVIEW: Record<string, boolean> = {
  LOW: false,
  MEDIUM: true,
  HIGH: true,
  CRITICAL: true,
}

export function renderTemplate(template: string, context: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    const value = context[key]
    return value !== undefined ? String(value) : `{{${key}}}`
  })
}

export function productModelName(productContext: string): string {
  const map: Record<string, string> = {
    audit: "auditEngagement",
    decision: "decision",
    "local-content": "localContentProject",
    sales: "salesDeal",
    "office-ai": "officeAiTask",
    workflowos: "clientWorkspace",
  }
  return map[productContext] || productContext
}
