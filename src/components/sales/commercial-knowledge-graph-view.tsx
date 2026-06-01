import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { CommercialKnowledgeGraphSnapshot } from "@/lib/sales/services/commercial-knowledge-graph-service";
import {
  KNOWLEDGE_GRAPH_EDGE_KINDS,
  KNOWLEDGE_GRAPH_NODE_KINDS,
} from "@/lib/sales/v02/knowledge-graph/types";

const NODE_KIND_LABELS: Record<
  (typeof KNOWLEDGE_GRAPH_NODE_KINDS)[number],
  string
> = {
  account: "حساب",
  industry: "قطاع",
  proof: "دليل",
  signal: "إشارة",
  opp: "فرصة",
  content: "محتوى",
  finding: "نتيجة",
};

const EDGE_KIND_LABELS: Record<
  (typeof KNOWLEDGE_GRAPH_EDGE_KINDS)[number],
  string
> = {
  uses: "يستخدم",
  mentions: "يذكر",
  wins_with: "يفوز مع",
  loses_with: "يخسر مع",
  related_to: "مرتبط بـ",
};

function RecommendationBadge({ label }: { label: string }) {
  return (
    <span className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
      {label}
    </span>
  );
}

interface CommercialKnowledgeGraphViewProps {
  data: CommercialKnowledgeGraphSnapshot;
}

export function CommercialKnowledgeGraphView({
  data,
}: CommercialKnowledgeGraphViewProps) {
  const hasGraph = data.totalNodes > 0 || data.totalEdges > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">الرسم المعرفي التجاري</h2>
          <p className="text-xs text-muted-foreground">{data.disclaimerAr}</p>
        </div>
        <RecommendationBadge label={data.recommendationLabel} />
      </div>

      {!hasGraph ? (
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="py-10 text-center text-sm text-muted-foreground">
            لا عقد أو روابط بعد — يُبنى الرسم من الحسابات والفرص والأدلة في
            المتجر التشغيلي
          </EnterpriseCardContent>
        </EnterpriseCard>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <EnterpriseCard module="sales">
              <EnterpriseCardContent className="pt-6">
                <p className="text-xs text-muted-foreground">العقد</p>
                <p className="text-xl font-bold">{data.totalNodes}</p>
              </EnterpriseCardContent>
            </EnterpriseCard>
            <EnterpriseCard module="sales">
              <EnterpriseCardContent className="pt-6">
                <p className="text-xs text-muted-foreground">الروابط</p>
                <p className="text-xl font-bold">{data.totalEdges}</p>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <EnterpriseCard module="sales">
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>توزيع العقد</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <ul className="space-y-2 text-sm">
                  {KNOWLEDGE_GRAPH_NODE_KINDS.map((kind) => (
                    <li
                      key={kind}
                      className="flex justify-between rounded border px-2 py-1"
                    >
                      <span>{NODE_KIND_LABELS[kind]}</span>
                      <span className="text-muted-foreground">
                        {data.nodeCounts[kind] ?? 0}
                      </span>
                    </li>
                  ))}
                </ul>
              </EnterpriseCardContent>
            </EnterpriseCard>

            <EnterpriseCard module="sales">
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>توزيع الروابط</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <ul className="space-y-2 text-sm">
                  {KNOWLEDGE_GRAPH_EDGE_KINDS.map((kind) => (
                    <li
                      key={kind}
                      className="flex justify-between rounded border px-2 py-1"
                    >
                      <span>{EDGE_KIND_LABELS[kind]}</span>
                      <span className="text-muted-foreground">
                        {data.edgeCounts[kind] ?? 0}
                      </span>
                    </li>
                  ))}
                </ul>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </div>

          <EnterpriseCard module="sales">
            <EnterpriseCardHeader>
              <EnterpriseCardTitle>أبرز العلاقات</EnterpriseCardTitle>
            </EnterpriseCardHeader>
            <EnterpriseCardContent>
              {data.topRelationships.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا علاقات مُرتبة</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {data.topRelationships.map((row) => (
                    <li
                      key={`${row.edgeKind}-${row.sourceKind}-${row.targetKind}`}
                      className="rounded-lg border border-border/60 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">
                          {NODE_KIND_LABELS[row.sourceKind as keyof typeof NODE_KIND_LABELS]} →{" "}
                          {EDGE_KIND_LABELS[row.edgeKind as keyof typeof EDGE_KIND_LABELS]} →{" "}
                          {NODE_KIND_LABELS[row.targetKind as keyof typeof NODE_KIND_LABELS]}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          ×{row.count}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </EnterpriseCardContent>
          </EnterpriseCard>
        </>
      )}
    </div>
  );
}
