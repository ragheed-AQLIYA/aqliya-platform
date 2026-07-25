import { getContactEvidence } from "@/actions/contact-detail-read-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload } from "lucide-react";

async function uploadEvidenceAction(formData: FormData) {
  "use server";
  const { uploadContactEvidence } = await import("@/actions/contact-actions");
  await uploadContactEvidence({
    contactId: formData.get("contactId") as string,
    filename: formData.get("filename") as string,
    fileType: formData.get("fileType") as string,
    description: (formData.get("description") as string) || undefined,
    evidenceType: (formData.get("evidenceType") as string) || "document",
  });
}

interface EvidenceItem {
  id: string;
  filename: string;
  evidenceType: string;
  fileType: string;
  sizeBytes?: number | null;
  description?: string | null;
  createdAt: Date;
}

interface EvidenceSectionProps {
  contactId: string;
  orgId: string;
}

export async function EvidenceSection({ contactId, orgId }: EvidenceSectionProps) {
  const evidenceResult = await getContactEvidence(contactId, orgId);
  const evidence = evidenceResult.evidence;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          الأدلة والملفات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <details className="border rounded-lg p-3">
          <summary className="cursor-pointer font-medium text-sm text-muted-foreground hover:text-foreground">
            رفع دليل جديد
          </summary>
          <form action={uploadEvidenceAction} className="mt-3 space-y-3">
            <input type="hidden" name="contactId" value={contactId} />
            <div>
              <label className="text-sm font-medium">اسم الملف</label>
              <Input name="filename" required placeholder="اسم الملف" />
            </div>
            <div>
              <label className="text-sm font-medium">نوع الملف</label>
              <Input name="fileType" required placeholder="pdf, docx, xlsx, image..." />
            </div>
            <div>
              <label className="text-sm font-medium">نوع الدليل</label>
              <select
                name="evidenceType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="document"
              >
                <option value="document">مستند</option>
                <option value="note">ملاحظة</option>
                <option value="reference">مرجع</option>
                <option value="attachment">مرفق</option>
              </select>
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
            {evidence.map((e: EvidenceItem) => (
              <div key={e.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{e.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.evidenceType} • {e.fileType}
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
