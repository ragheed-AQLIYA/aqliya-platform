import { getTrialBalanceLines } from "@/lib/audit/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Layers } from "lucide-react";
import { AuditSamplingForm } from "./audit-sampling-form";

interface AuditSamplingPageProps {
  engagementId: string;
}

export async function AuditSamplingPage({ engagementId }: AuditSamplingPageProps) {
  const lines = await getTrialBalanceLines(engagementId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" />
            محرك العينة / Sampling
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          عدد بنود الميزان: {lines.length}. العينة مساعدة وقابلة للتكرار عبر البذرة
          (seed).
        </CardContent>
      </Card>

      {lines.length === 0 ? (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="p-4 text-sm">
            <AlertTriangle className="h-4 w-4 inline me-1" />
            ارفع ميزان المراجعة أولاً من تبويب ميزان المراجعة.
          </CardContent>
        </Card>
      ) : (
        <AuditSamplingForm engagementId={engagementId} lineCount={lines.length} />
      )}

      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
        <CardContent className="p-4 text-sm">
          <AlertTriangle className="h-4 w-4 inline me-1" />
          الذكاء الاصطناعي لا يختار العينة النهائية — المراجع يقرر الاعتماد والتوسعة.
        </CardContent>
      </Card>
    </div>
  );
}
