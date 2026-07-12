// ─── Model Governance Page ───
// Lists registered AI models from AiModelRegistry + file-based registry.
// ADMIN-only. Allows register → review → approve → deploy → deprecate lifecycle.

import { getCurrentUser } from "@/lib/auth"
import { listModels, getModelGovernanceStats } from "@/lib/platform/model-governance/model-governance-service"
import { listModelRegistryEntries } from "@/lib/core/ai/model-registry"
import { ModelGovernanceClient } from "./model-governance-client"

export const dynamic = "force-dynamic"

export default async function ModelsPage() {
  await getCurrentUser()

  const [models, stats, registryEntries] = await Promise.all([
    listModels(),
    getModelGovernanceStats(),
    Promise.resolve(listModelRegistryEntries()),
  ])

  return (
    <div className="mx-auto max-w-6xl p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">حوكمة النماذج</h1>
        <p className="text-sm text-muted-foreground">
          إدارة دورة حياة نماذج الذكاء الاصطناعي — التسجيل، المراجعة، الاعتماد، النشر، الإيقاف
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <SummaryCard label="إجمالي النماذج" value={stats.total} />
        <SummaryCard label="قيد المراجعة" value={stats.pendingReview} />
        <SummaryCard label="معتمد" value={stats.byStatus["APPROVED"] ?? 0} />
        <SummaryCard label="نشر نشط" value={stats.activeDeployments} />
        <SummaryCard label="سجل ملفات" value={registryEntries.length} />
      </div>

      <ModelGovernanceClient
        models={models.map((m: Record<string, unknown>) => ({
          id: m.id as string,
          name: m.name as string,
          provider: m.provider as string,
          version: m.version as string,
          modelType: m.modelType as string,
          riskLevel: m.riskLevel as string,
          status: m.status as string,
          requiresReview: m.requiresReview as boolean,
          requiresApproval: m.requiresApproval as boolean,
          createdAt: (m.createdAt as Date).toISOString(),
        }))}
        registryEntries={registryEntries.map((e) => ({
          id: e.id,
          provider: e.providerId,
          status: e.status,
        }))}
      />
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
