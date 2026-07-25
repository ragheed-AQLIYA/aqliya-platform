import { RiskFlagsPanel } from "@/components/contacts/risk-flags-panel";
import type { RiskFlag } from "@/actions/contact-actions";

interface RiskFlagsSectionProps {
  contactId: string;
  metadata: unknown;
}

function extractRiskFlags(metadata: unknown): RiskFlag[] {
  if (!metadata || typeof metadata !== "object") return [];
  const meta = metadata as Record<string, unknown>;
  return (meta.riskFlags as RiskFlag[]) || [];
}

export async function RiskFlagsSection({ contactId, metadata }: RiskFlagsSectionProps) {
  const riskFlags = extractRiskFlags(metadata);
  return <RiskFlagsPanel key={contactId} contactId={contactId} initialFlags={riskFlags} />;
}
