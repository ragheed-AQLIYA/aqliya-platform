import type { ExecutiveCommercialSection } from "@/lib/sales/services/executive-commercial-dashboard-service";

export function SectionFallback({
  section,
  emptyMessage,
}: {
  section: ExecutiveCommercialSection<unknown>;
  emptyMessage?: string;
}) {
  const message =
    section.fallbackMessageAr ??
    (section.status === "empty" ? emptyMessage : undefined) ??
    "\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u2014 \u062a\u062d\u0642\u0642 \u0645\u0646 \u062a\u0647\u064a\u0626\u0629 SalesOS.";
  return (
    <p className="py-4 text-center text-xs text-muted-foreground">{message}</p>
  );
}
