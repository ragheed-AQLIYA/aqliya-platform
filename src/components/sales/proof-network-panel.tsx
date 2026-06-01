import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import {
  proofNetworkEdgeKindLabelAr,
  proofNetworkNodeKindLabelAr,
  PROOF_NETWORK_PANEL_LABEL,
  type CommercialProofNetworkOverview,
} from "@/lib/sales/vnext/commercial-proof-network-overview";

export function ProofNetworkPanel({
  overview,
}: {
  overview: CommercialProofNetworkOverview;
}) {
  const { summary, nodes, edges } = overview;
  const nodesByKind = {
    proof_asset: nodes.filter((n) => n.kind === "proof_asset"),
    opportunity: nodes.filter((n) => n.kind === "opportunity"),
    objection: nodes.filter((n) => n.kind === "objection"),
  };

  return (
    <div className="space-y-4" id="proof">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold">شبكة الإثبات</h2>
          <Badge variant="outline" className="text-[10px]">
            DRAFT
          </Badge>
        </div>
        <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
          {overview.disclaimerAr}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {PROOF_NETWORK_PANEL_LABEL} — للمراجعة البشرية.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="أصول إثبات" value={summary.assetCount} />
        <Metric label="فرص مربوطة" value={summary.linkedAssetCount} />
        <Metric label="روابط" value={summary.edgeCount} />
        <Metric
          label="تغطية متوسطة"
          value={`${summary.avgCoveragePct}%`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {(
          Object.entries(nodesByKind) as Array<
            [keyof typeof nodesByKind, typeof nodes]
          >
        ).map(([kind, kindNodes]) => (
          <EnterpriseCard key={kind} module="sales">
            <EnterpriseCardHeader className="pb-2">
              <EnterpriseCardTitle className="text-sm">
                {proofNetworkNodeKindLabelAr(kind)}
              </EnterpriseCardTitle>
            </EnterpriseCardHeader>
            <EnterpriseCardContent>
              {kindNodes.length === 0 ? (
                <p className="text-xs text-muted-foreground">لا عناصر</p>
              ) : (
                <ul className="max-h-48 space-y-1 overflow-y-auto text-xs">
                  {kindNodes.slice(0, 8).map((node) => (
                    <li
                      key={node.id}
                      className="truncate rounded border px-2 py-1"
                      title={node.label}
                    >
                      {node.label}
                    </li>
                  ))}
                  {kindNodes.length > 8 && (
                    <li className="text-muted-foreground">
                      +{kindNodes.length - 8} أخرى
                    </li>
                  )}
                </ul>
              )}
            </EnterpriseCardContent>
          </EnterpriseCard>
        ))}
      </div>

      {edges.length > 0 && (
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader className="pb-2">
            <EnterpriseCardTitle className="text-sm">
              روابط الشبكة (طبقات)
            </EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <ul className="space-y-1 text-xs">
              {edges.slice(0, 12).map((edge) => {
                const source = nodes.find((n) => n.id === edge.sourceId);
                const target = nodes.find((n) => n.id === edge.targetId);
                return (
                  <li
                    key={edge.id}
                    className="flex flex-wrap items-center gap-2 rounded border px-2 py-1"
                  >
                    <span className="truncate">{source?.label ?? edge.sourceId}</span>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {proofNetworkEdgeKindLabelAr(edge.kind)}
                    </Badge>
                    <span className="truncate">{target?.label ?? edge.targetId}</span>
                  </li>
                );
              })}
            </ul>
            {edges.length > 12 && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                +{edges.length - 12} رابط إضافي
              </p>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}

      {summary.recommendationCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {summary.recommendationCount} توصية ربط أدلة —{" "}
          <Link href="/sales/opportunities" className="text-primary hover:underline">
            راجع المسار
          </Link>
        </p>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
