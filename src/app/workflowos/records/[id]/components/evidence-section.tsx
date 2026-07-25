"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";
import type { EvidenceItem } from "./types";

interface Props {
  evidence: EvidenceItem[];
  uploadEvidence: (formData: FormData) => Promise<void>;
}

export function EvidenceSection({ evidence, uploadEvidence }: Props) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          الأدلة والملفات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <details className="border rounded-lg p-3">
          <summary className="cursor-pointer font-medium text-sm text-muted-foreground hover:text-foreground">
            رفع دليل جديد
          </summary>
          <form action={uploadEvidence} className="mt-3 space-y-3">
            <div>
              <label className="text-sm font-medium">اسم الملف</label>
              <Input name="filename" required placeholder="اسم الملف" />
            </div>
            <div>
              <label className="text-sm font-medium">نوع الملف</label>
              <Input name="fileType" required placeholder="pdf, docx, xlsx..." />
            </div>
            <div>
              <label className="text-sm font-medium">رقم الخطوة (اختياري)</label>
              <Input name="stepIndex" type="number" placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium">وصف</label>
              <Textarea name="description" placeholder="وصف الملف" />
            </div>
            <Button type="submit" size="sm">
              <Upload className="ml-1 h-4 w-4" />
              رفع
            </Button>
          </form>
        </details>

        {evidence.length === 0 ? (
          <p className="text-muted-foreground text-sm">لا توجد أدلة مرفوعة</p>
        ) : (
          <div className="space-y-2">
            {evidence.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{e.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.fileType}
                      {e.stepIndex !== null && ` • خطوة ${e.stepIndex}`}
                      {e.sizeBytes && ` • ${(e.sizeBytes / 1024).toFixed(1)} KB`}
                    </p>
                    {e.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {new Date(e.createdAt).toLocaleDateString("ar-SA")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
