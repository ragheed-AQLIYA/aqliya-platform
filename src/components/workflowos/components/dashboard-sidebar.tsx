"use client";

import { WorkflowReviewQueue } from "@/components/workflowos/workflow-review-queue";
import Link from "next/link";
import {
  ShieldCheck,
  FolderKanban,
  Download,
  AlertTriangle,
} from "lucide-react";

export function DashboardSidebar({
  clientId,
  userRole,
  pendingExports,
  escalated,
}: {
  clientId: string;
  userRole: string | null;
  pendingExports: number;
  escalated: number;
}) {
  const canReview = userRole === "Reviewer" || userRole === "PlatformAdmin";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold mb-2">قائمة المراجعة</h2>
        {canReview ? (
          <WorkflowReviewQueue clientId={clientId} />
        ) : (
          <div className="rounded-lg border bg-card p-4 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-xs text-muted-foreground">
              متاحة للمراجعين فقط
            </p>
          </div>
        )}
      </div>

      <Link
        href="/workflowos/records"
        className="block rounded-lg border bg-card p-4 text-center hover:bg-muted/30 transition-colors"
      >
        <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-2 text-xs text-muted-foreground">
          عرض جميع القضايا وإدارة الأدلة
        </p>
      </Link>

      {canReview && (
        <Link
          href="/workflowos/records"
          className="block rounded-lg border bg-card p-4 text-center hover:bg-muted/30 transition-colors"
        >
          <Download className="mx-auto h-8 w-8 text-blue-600/50" />
          <p className="mt-2 text-xs text-muted-foreground">
            طلبات التصدير
            {pendingExports > 0 && (
              <span className="me-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                {pendingExports}
              </span>
            )}
          </p>
        </Link>
      )}

      {escalated > 0 && (
        <Link
          href="/workflowos/records"
          className="block rounded-lg border border-orange-200 bg-orange-50 p-4 text-center hover:bg-orange-100 transition-colors"
        >
          <AlertTriangle className="mx-auto h-8 w-8 text-orange-600/70" />
          <p className="mt-2 text-xs font-medium text-orange-800">
            طلبات مُصعدة — {escalated}
          </p>
        </Link>
      )}

      <Link
        href="/workflowos/records"
        className="block rounded-lg border bg-card p-4 text-center hover:bg-muted/30 transition-colors"
      >
        <Download className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-2 text-xs text-muted-foreground">
          تصدير — متاح بعد اعتماد القضية
        </p>
      </Link>

      <Link
        href="/workflowos/admin"
        className="block rounded-lg border bg-card p-4 text-center hover:bg-muted/30 transition-colors"
      >
        <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-2 text-xs text-muted-foreground">
          إدارة القوالب والإعدادات
        </p>
      </Link>
    </div>
  );
}
