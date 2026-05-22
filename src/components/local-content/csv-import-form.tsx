"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { importLocalContentSpendCsvAction } from "@/actions/localcontent-actions";
import { Upload, CheckCircle2, XCircle } from "lucide-react";

interface CsvImportFormProps {
  projectId: string;
  onImportComplete?: () => void;
}

export function CsvImportForm({
  projectId,
  onImportComplete,
}: CsvImportFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    rejected: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setResult(null);
    const csvText = formData.get("csvText") as string;
    if (!csvText || csvText.trim().length === 0) {
      setError("الرجاء لصق نص CSV");
      setLoading(false);
      return;
    }
    const res = await importLocalContentSpendCsvAction(projectId, csvText);
    if (res.ok) {
      setResult(res.data);
      onImportComplete?.();
    } else {
      setError(res.error);
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1"
      >
        <Upload className="h-4 w-4" />
        استيراد CSV
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">استيراد سجلات إنفاق من CSV</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="csvText">
              نص CSV (amount,supplierName,category,period)
            </Label>
            <textarea
              id="csvText"
              name="csvText"
              rows={6}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
              placeholder={`amount,supplierName,category,period,currency,contractReference\n5000000,شركة التقنية,technology,Q1,SAR,PO-001\n3000000,GlobalTech,technology,Q2,USD,PO-002`}
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {result && (
            <div className="rounded-md bg-muted p-3 text-xs space-y-1">
              <div className="flex items-center gap-1 text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                تم إنشاء {result.created} سجل
              </div>
              {result.rejected > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-3.5 w-3.5" />
                  تم رفض {result.rejected} صف
                </div>
              )}
              {result.errors.length > 0 && (
                <details>
                  <summary className="cursor-pointer text-muted-foreground">
                    التفاصيل
                  </summary>
                  <ul className="list-disc list-inside">
                    {result.errors.slice(0, 10).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "جارٍ..." : "استيراد"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setResult(null);
                setError(null);
              }}
            >
              إغلاق
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
