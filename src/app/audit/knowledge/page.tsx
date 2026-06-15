import { KnowledgeDashboard } from "@/components/audit/knowledge/knowledge-dashboard";

export default function KnowledgePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">المعرفة التدقيقية</h1>
        <p className="text-muted-foreground">
          تحليل أنماط المهام السابقة، التوصيات الذكية، والمعايير القطاعية
        </p>
      </div>
      <KnowledgeDashboard auditOrganizationId="" />
    </div>
  );
}
