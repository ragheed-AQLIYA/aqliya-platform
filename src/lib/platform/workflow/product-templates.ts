import { getProductTemplate } from "@/lib/core/workflow";

export function getWorkflowTemplateForProduct(productKey: string) {
  const template = getProductTemplate(productKey);
  if (!template) return null;

  return {
    id: template.productKey,
    gates: template.transitions.map((transition) => ({
      id: `${transition.action}:${transition.to}`,
      name: `${transition.action} → ${transition.to}`,
      required: true,
    })),
  };
}
