"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EvidenceWarningCardsProps {
  engagementId: string;
  evidenceCount: number;
  linkedEvidenceCount: number;
}

export function EvidenceWarningCards({
  engagementId,
  evidenceCount,
  linkedEvidenceCount,
}: EvidenceWarningCardsProps) {
  return (
    <>
      {evidenceCount === 0 && (
        <Card className="rounded-[24px] border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                النتائج تتطلب أدلة داعمة
              </p>
              <p className="text-amber-700 dark:text-amber-400">
                أضف أدلة في تبويب الأدلة قبل تسجيل نتائج قابلة للمراجعة. قبول
                الدليل لا يُعد اعتماداً — المراجعة البشرية مطلوبة.
              </p>
            </div>
            <Link href={`/audit/engagements/${engagementId}/evidence`}>
              <Button size="sm" variant="outline">
                <FileText className="size-4 me-1" />
                الانتقال إلى الأدلة
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {evidenceCount > 0 && linkedEvidenceCount === 0 && (
        <Card className="rounded-[24px] border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="pt-4 text-sm text-blue-800 dark:text-blue-300">
            توجد {evidenceCount} أدلة بدون روابط. اربط الأدلة بالنتائج من تبويب
            الأدلة قبل طلب الاعتماد.
          </CardContent>
        </Card>
      )}
    </>
  );
}
