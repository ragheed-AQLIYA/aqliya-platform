"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download, Clock, CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react";
import type { RecordWithTemplate } from "./types";

interface Props {
  record: RecordWithTemplate;
  id: string;
  onRequestExport: () => Promise<void>;
  onApproveExport: () => Promise<void>;
  onRejectExport: (formData: FormData) => Promise<void>;
}

export function ExportSection({ record, id, onRequestExport, onApproveExport, onRejectExport }: Props) {
  if (record.status !== "completed") return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          تصدير السجل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">حالة التصدير:</span>
          {record.exportStatus === "none" && (
            <Badge variant="outline">لم يُطلب بعد</Badge>
          )}
          {record.exportStatus === "requested" && (
            <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
              <Clock className="h-3 w-3" />قيد المراجعة
            </Badge>
          )}
          {record.exportStatus === "approved" && (
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />معتمد
            </Badge>
          )}
          {record.exportStatus === "rejected" && (
            <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
              <XCircle className="h-3 w-3" />مرفوض
            </Badge>
          )}
          {record.escalatedAt && (
            <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />تم التصعيد
            </Badge>
          )}
        </div>

        {record.exportRejectedReason && record.exportStatus === "rejected" && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-800">سبب الرفض</p>
            <p className="text-sm text-red-600 mt-1">{record.exportRejectedReason}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {record.exportStatus === "none" && (
            <form action={onRequestExport}>
              <Button type="submit" size="sm" variant="outline">
                <Download className="ms-1 h-4 w-4" />
                طلب تصدير
              </Button>
            </form>
          )}

          {record.exportStatus === "requested" && (
            <>
              <form action={onApproveExport}>
                <Button type="submit" size="sm">
                  <CheckCircle2 className="ms-1 h-4 w-4" />
                  اعتماد التصدير
                </Button>
              </form>
              <form action={onRejectExport} className="flex gap-2">
                <Input name="reason" placeholder="سبب الرفض" className="w-48 h-9 text-sm" required />
                <Button type="submit" size="sm" variant="destructive">
                  <XCircle className="ms-1 h-4 w-4" />
                  رفض
                </Button>
              </form>
            </>
          )}

          {record.exportStatus === "approved" && (
            <a
              href={`/api/workflowos/records/${id}/download`}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              تنزيل التصدير
            </a>
          )}

          {record.exportStatus === "rejected" && (
            <form action={onRequestExport}>
              <Button type="submit" size="sm" variant="outline">
                <Download className="ms-1 h-4 w-4" />
                إعادة طلب
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
