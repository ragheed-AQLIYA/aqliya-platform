import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EvidenceInfoCard() {
  return (
    <Card className="rounded-[24px] border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
      <CardContent className="flex gap-3 pt-4">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-blue-800 dark:text-blue-300">
            الأدلة مادة داعمة — لا تُعد اعتماداً تلقائياً
          </p>
          <p className="text-blue-700 dark:text-blue-400">
            رفع الدليل أو قبوله لا يغني عن المراجعة والاعتماد البشري. سجّل
            الروابط مع النتائج قبل الانتقال إلى المراجعة النهائية.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
