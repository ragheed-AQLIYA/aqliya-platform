import { getCurrentUser } from "@/lib/auth";
import {
  getSalesIntelligenceMemory,
  initSalesWorkspace,
} from "@/lib/sales/service";
import { IntelligenceHub } from "@/components/sales/intelligence-hub";
import { IntelligenceMemoryView } from "@/components/sales/intelligence-memory-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        مسودة — غير مُتحقق بعد (pilot DB aligned; service stubs pending)
      </CardContent>
    </Card>
  );
}

export default async function SalesIntelligencePage() {
  const user = await getCurrentUser();
  initSalesWorkspace(user);
  const memory = await getSalesIntelligenceMemory(user);

  return (
    <IntelligenceHub
      marketPanel={<PlaceholderPanel title="ذكاء السوق" />}
      proofPanel={<PlaceholderPanel title="فعالية الإثبات" />}
      memoryPanel={
        <IntelligenceMemoryView
          objections={memory.objections}
          competitors={memory.competitors}
          signals={memory.signals}
          auditRecent={memory.auditRecent}
          interactionCount={memory.interactionCount}
          opportunityInsights={memory.opportunityInsights}
        />
      }
      graphPanel={<PlaceholderPanel title="Knowledge graph / proof network" />}
    />
  );
}
