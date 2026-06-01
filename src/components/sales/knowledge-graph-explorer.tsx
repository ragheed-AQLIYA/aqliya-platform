import { Badge } from "@/components/ui/badge";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { CommercialKnowledgeGraphSnapshot } from "@/lib/sales/services/commercial-knowledge-graph-service";

const NODE_KIND_LABELS_AR: Record<string, string> = {
  account: "حساب",
  opp: "فرصة",
  industry: "قطاع",
  proof: "دليل",
  objection: "اعتراض",
  competitor: "منافس",
  finding: "نتيجة",
  signal: "إشارة",
};

const EDGE_KIND_LABELS_AR: Record<string, string> = {
  related_to: "مرتبط بـ",
  uses: "يستخدم",
  supports: "يدعم",
  blocks: "يعيق",
  mentions: "يذكر",
  competes_with: "ينافس",
};

export function KnowledgeGraphExplorer({
  snapshot,
}: {
  snapshot: CommercialKnowledgeGraphSnapshot;
}) {
  const nodeEntries = Object.entries(snapshot.nodeCounts).filter(
    ([, count]) => count > 0,
  );
  const edgeEntries = Object.entries(snapshot.edgeCounts).filter(
    ([, count]) => count > 0,
  );

  return (
    <div className="space-y-4" id="graph">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold">رسم المعرفة التجاري</h2>
          <Badge variant="outline" className="text-[10px]">
            DRAFT
          </Badge>
        </div>
        <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
          {snapshot.disclaimerAr}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {snapshot.recommendationLabel} — للتحليل فقط، ليس قراراً.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-4">
            <p className="text-xs text-muted-foreground">العُقد</p>
            <p className="text-2xl font-bold">{snapshot.totalNodes}</p>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-4">
            <p className="text-xs text-muted-foreground">الروابط</p>
            <p className="text-2xl font-bold">{snapshot.totalEdges}</p>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-4">
            <p className="text-xs text-muted-foreground">أنماط العلاقات</p>
            <p className="text-2xl font-bold">
              {snapshot.topRelationships.length}
            </p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader className="pb-2">
            <EnterpriseCardTitle className="text-sm">
              توزيع العُقد
            </EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {nodeEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                لا عُقد — تحقق من تهيئة SalesOS.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {nodeEntries.map(([kind, count]) => (
                  <li
                    key={kind}
                    className="flex items-center justify-between rounded border px-2 py-1"
                  >
                    <span>{NODE_KIND_LABELS_AR[kind] ?? kind}</span>
                    <span className="font-mono text-muted-foreground">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader className="pb-2">
            <EnterpriseCardTitle className="text-sm">
              توزيع الروابط
            </EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {edgeEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا روابط بعد.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {edgeEntries.map(([kind, count]) => (
                  <li
                    key={kind}
                    className="flex items-center justify-between rounded border px-2 py-1"
                  >
                    <span>{EDGE_KIND_LABELS_AR[kind] ?? kind}</span>
                    <span className="font-mono text-muted-foreground">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader className="pb-2">
          <EnterpriseCardTitle className="text-sm">
            أبرز أنماط العلاقات
          </EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          {snapshot.topRelationships.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              لا أنماط كافية — أضف تفاعلات وأدلة.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {snapshot.topRelationships.map((pattern) => (
                <li
                  key={`${pattern.edgeKind}-${pattern.sourceKind}-${pattern.targetKind}`}
                  className="rounded border px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {EDGE_KIND_LABELS_AR[pattern.edgeKind] ?? pattern.edgeKind}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {NODE_KIND_LABELS_AR[pattern.sourceKind] ??
                        pattern.sourceKind}{" "}
                      →{" "}
                      {NODE_KIND_LABELS_AR[pattern.targetKind] ??
                        pattern.targetKind}
                    </span>
                    <span className="ms-auto font-mono text-xs">
                      ×{pattern.count}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>

      <p className="text-[11px] text-muted-foreground">
        آخر بناء: {new Date(snapshot.builtAt).toLocaleString("ar-SA")}
      </p>
    </div>
  );
}
