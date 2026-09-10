"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";

interface ExportSectionProps {
  status: string;
  loadingExport: boolean;
  exportData: string | null;
  copied: boolean;
  onExport: (format: "json" | "markdown") => void;
  onCopy: () => void;
  onDownload: () => void;
}

export function ExportSection({
  status,
  loadingExport,
  exportData,
  copied,
  onExport,
  onCopy,
  onDownload,
}: ExportSectionProps) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Download className="h-5 w-5" />
          تصدير
        </h3>
      </div>
      <Card className="mb-4 border-blue-200 bg-blue-50 p-4">
        <div className="text-sm text-blue-900 space-y-1">
          <p className="font-semibold">تجهيز سجل التصدير</p>
          <p>
            هذا الإجراء يجهز نسخة JSON أو Markdown من سجل القرار الحالي
            للمراجعة أو الأرشفة. لا يعني ذلك اعتمادًا نهائيًا أو نشرًا
            خارجيًا.
          </p>
          <p className="text-xs text-blue-700">
            يتم تسجيل تجهيز التصدير في سجل المنصة، ويجب التعامل مع أي ملف
            ناتج كمسودة تشغيلية إذا لم تكن حالة القرار معتمدة.
          </p>
        </div>
      </Card>
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport("json")}
          disabled={loadingExport}
        >
          تجهيز JSON
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport("markdown")}
          disabled={loadingExport}
        >
          تجهيز Markdown
        </Button>
      </div>
      {exportData && (
        <div className="space-y-2">
          <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            {status === "APPROVED"
              ? "القرار معتمد، لكن ما يزال الملف الناتج سجلًا تشغيليًا يجب استخدامه ضمن سياق الحوكمة المؤسسية."
              : "القرار غير معتمد حاليًا، لذلك يجب التعامل مع هذا التصدير كمسودة تشغيلية للمراجعة فقط."}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
            >
              <Download className="h-4 w-4 me-1" />
              تحميل الملف
            </Button>
            <Button variant="outline" size="sm" onClick={onCopy}>
              <Copy className="h-4 w-4 me-1" />
              {copied ? "تم النسخ!" : "نسخ المحتوى"}
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap">
            {exportData}
          </pre>
        </div>
      )}
    </section>
  );
}
