"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export function AiGovernanceRules() {
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            قواعد حوكمة AI / AI Governance Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 p-2 border rounded">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>AI يصدر اقتراحات فقط — الموافقة النهائية بيد الإنسان</span>
            </div>
            <div className="flex items-start gap-2 p-2 border rounded">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>جميع إجراءات AI مسجلة في سجل التدقيق</span>
            </div>
            <div className="flex items-start gap-2 p-2 border rounded">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>مخرجات AI تحمل درجة ثقة ومعلومات المصدر</span>
            </div>
            <div className="flex items-start gap-2 p-2 border rounded">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>لا يصدر AI قرارات نهائية أو تراخيص أو شهادات</span>
            </div>
            <div className="flex items-start gap-2 p-2 border rounded">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>جميع المخرجات مدعومة بأدلة ومراجع</span>
            </div>
            <div className="flex items-start gap-2 p-2 border rounded">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>البيانات الحساسة لا تُرسل لمزودين خارجيين بدون ضوابط</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 justify-center">
        <Link href="/local-content/quality-dashboard">
          <Button variant="outline" size="sm">
            ← جودة AI المحتوى المحلي
          </Button>
        </Link>
        <Link href="/local-content/review-center">
          <Button variant="outline" size="sm">
            ← مركز مراجعة AI
          </Button>
        </Link>
        <Link href="/settings/audit-logs">
          <Button variant="outline" size="sm">
            ← سجل التدقيق
          </Button>
        </Link>
      </div>
    </>
  );
}
