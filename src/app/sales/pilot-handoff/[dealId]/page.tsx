import { redirect } from "next/navigation";

export default async function SalesPilotHandoffAliasPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const { dealId } = await params;
  redirect(`/sales/deals/${dealId}/pilot`);
}
