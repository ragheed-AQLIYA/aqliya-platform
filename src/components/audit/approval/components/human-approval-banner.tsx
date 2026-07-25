"use client";

import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function HumanApprovalBanner() {
  return (
    <Card className="rounded-[24px] border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
      <CardContent className="flex gap-3 pt-4">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-blue-800 dark:text-blue-300">
            قرار بشري — لا اعتماد تلقائي
          </p>
          <p className="text-blue-700 dark:text-blue-400">
            الذكاء الاصطناعي يساعد فقط. الاعتماد النهائي يتطلب مراجعاً/شريكاً
            بشرياً مع تسجيل في سجل التدقيق.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
