"use client";

import type { AiGovernanceStats } from "@/actions/ai-governance-actions";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Brain,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface Props {
  error: string | null;
  stats: AiGovernanceStats | null;
}

export function AiGovernanceHeader({ error, stats }: Props) {
  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">حوكمة الذكاء الاصطناعي</h1>
          <p className="text-sm text-muted-foreground">
            AI Governance Dashboard — سجل مركزي لنشاط AI عبر جميع المنتجات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/local-content/quality-dashboard">
            <Button variant="outline" size="sm">
              ← جودة AI
            </Button>
          </Link>
          <Link href="/settings/audit-logs">
            <Button variant="outline" size="sm">
              ← سجل التدقيق
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4 flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">تعذر تحميل بيانات الحوكمة: {error}</p>
          </CardContent>
        </Card>
      )}

      {!error && !stats && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Brain className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>لا توجد بيانات حوكمة AI بعد</p>
            <p className="text-sm mt-1">
              تظهر البيانات بعد تشغيل ميزات AI في المنتجات
            </p>
          </CardContent>
        </Card>
      )}

      {stats && (
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50 dark:bg-blue-950/20 p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">مبدأ الحوكمة / Governance Principle</p>
              <p className="text-xs text-muted-foreground">
                AI assists. Humans decide. Evidence governs. —
                الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                لا يصدر AI قرارات نهائية. جميع مخرجات AI تخضع للمراجعة البشرية.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
