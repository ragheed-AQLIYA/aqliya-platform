import { MaterialityCalculatorForm } from "@/components/audit/materiality/materiality-calculator-form";

export default async function MaterialityPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;

  return (
    <div className="p-6">
      <MaterialityCalculatorForm engagementId={engagementId} />
    </div>
  );
}
