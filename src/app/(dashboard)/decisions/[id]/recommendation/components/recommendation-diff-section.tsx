"use client";

import { AlertTriangle, FileDiff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FieldDiff } from "@/lib/recommendation/recommendation-diff";

interface SnapshotWarning {
  differs: boolean;
  approvedAction: string;
  currentAction: string;
  approvedAt: string | null;
  approver: string | null;
}

interface DiffData {
  fields: FieldDiff[];
  changeCount: number;
  summary: string;
  approvedAt: string | null;
  approver: string | null;
}

interface Props {
  snapshotWarning: SnapshotWarning;
  diffData: DiffData | null;
  showDiff: boolean;
  loadingDiff: boolean;
  showPublishConfirm: boolean;
  saving: boolean;
  onToggleDiff: () => void;
  onLoadDiff: () => void;
  onPublish: () => void;
  onCancelOverride: () => void;
}

function DiffView({ diffData }: { diffData: DiffData }) {
  const unchangedCount = diffData.fields.filter((f) => !f.changed).length;
  return (
    <div className="rounded-2xl border p-4">
      <h4 className="text-sm font-semibold mb-3">
        مقارنة الحقول — {diffData.changeCount} تغيير
      </h4>
      <div className="space-y-2">
        {diffData.fields
          .filter((f) => f.changed)
          .map((field) => (
            <div
              key={field.field}
              className="grid grid-cols-2 gap-3 text-sm"
            >
              <div className="rounded border border-green-200 bg-green-50 p-3">
                <div className="text-xs font-medium text-green-700 mb-1">
                  المعتمد: {field.label}
                </div>
                <div className="whitespace-pre-wrap text-xs text-green-900">
                  {field.approvedValue ?? "(فارغ)"}
                </div>
              </div>
              <div className="rounded border border-red-200 bg-red-50 p-3">
                <div className="text-xs font-medium text-red-700 mb-1">
                  الحالي: {field.label}
                </div>
                <div className="whitespace-pre-wrap text-xs text-red-900">
                  {field.currentValue ?? "(فارغ)"}
                </div>
              </div>
            </div>
          ))}
        {unchangedCount > 0 && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            {unchangedCount} حقول غير متغيرة:{" "}
            {diffData.fields
              .filter((f) => !f.changed)
              .map((f) => f.label)
              .join("، ")}
          </div>
        )}
      </div>
    </div>
  );
}

function PublishConfirm({ saving, onPublish, onCancel }: { saving: boolean; onPublish: () => void; onCancel: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700">
            هل تريد نشر النسخة الحالية المتغيرة بدل النسخة المعتمدة؟
          </p>
          <p className="text-xs text-red-600 mt-1">
            سيُسجل ذلك كتجاوز في سجل التدقيق، مع بقاء النسخة المعتمدة محفوظة.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onPublish}
              disabled={saving}
            >
              نشر النسخة الحالية مع تسجيل التجاوز
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              إلغاء والعودة للنسخة المعتمدة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecommendationDiffSection({
  snapshotWarning,
  diffData,
  showDiff,
  loadingDiff,
  showPublishConfirm,
  saving,
  onToggleDiff,
  onLoadDiff,
  onPublish,
  onCancelOverride,
}: Props) {
  return (
    <div className="mb-4 space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-800">
              التوصية الحالية تختلف عن النسخة المعتمدة
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              {diffData?.summary ||
                "تغيرت التوصية الحالية منذ اعتمادها بواسطة " +
                  snapshotWarning.approver +
                  " (" +
                  snapshotWarning.approvedAt +
                  ")."}
            </p>
            <p className="text-sm text-amber-700 mt-1">
              يُوصى بإعادة المراجعة قبل النشر.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onToggleDiff}
                disabled={loadingDiff}
              >
                <FileDiff className="h-4 w-4 mr-1" />
                {showDiff ? "إخفاء الفروقات" : "عرض الفروقات جنبًا إلى جنب"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onLoadDiff}
                disabled={loadingDiff}
              >
                {loadingDiff ? "جارٍ التحميل..." : "تحديث الفروقات"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showDiff && diffData && <DiffView diffData={diffData} />}

      {showPublishConfirm && (
        <PublishConfirm
          saving={saving}
          onPublish={onPublish}
          onCancel={onCancelOverride}
        />
      )}
    </div>
  );
}
