"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { batchEnrichAccountsAction } from "@/actions/sales-intel-actions";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Building2,
} from "lucide-react";

export function BatchEnrichButton() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    total?: number;
    enriched?: number;
    failed?: number;
    error?: string;
  } | null>(null);

  const handleBatchEnrich = async () => {
    setLoading(true);
    setProgress(10);
    setResult(null);

    try {
      setProgress(30);
      const resp = await batchEnrichAccountsAction(["apollo", "ocean", "clay"]);
      setProgress(100);

      if (resp.success && resp.data) {
        setResult({
          total: resp.data.totalAccounts,
          enriched: resp.data.enrichedAccounts,
          failed: resp.data.failedAccounts.length,
        });
      } else {
        setResult({ error: resp.error ?? "فشل الإثراء" });
      }
    } catch (err) {
      setResult({
        error: err instanceof Error ? err.message : "فشل الإثراء",
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleBatchEnrich}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? "جاري إثراء الحسابات..." : "إثراء جميع الحسابات"}
      </Button>

      {loading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            جاري البحث في Apollo.io → Ocean.io → Clay...
          </p>
        </div>
      )}

      {result?.total !== undefined && (
        <div className="space-y-2 p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">
              اكتمل الإثراء
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Building2 className="h-4 w-4" />
                <span className="font-bold">{result.total}</span>
              </div>
              <span className="text-xs text-muted-foreground">إجمالي</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-bold">{result.enriched}</span>
              </div>
              <span className="text-xs text-muted-foreground">تم إثراؤها</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="font-bold">{result.failed}</span>
              </div>
              <span className="text-xs text-muted-foreground">فشلت</span>
            </div>
          </div>
        </div>
      )}

      {result?.error && (
        <div className="flex items-center gap-2 p-2 rounded bg-red-50 text-sm text-red-600">
          <XCircle className="h-4 w-4" />
          {result.error}
        </div>
      )}
    </div>
  );
}
