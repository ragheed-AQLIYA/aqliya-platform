"use client";

import { useCallback, useEffect, useState } from "react";
import { GitCompare, Loader2, RefreshCw } from "lucide-react";
import {
  isReconciliationEnabledAction,
  runReconciliationAction,
} from "@/actions/audit-reconciliation-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReconciliationRunResult } from "@/lib/audit/reconciliation/types";

interface ReconciliationPanelProps {
  engagementId: string;
}

export function ReconciliationPanel({ engagementId }: ReconciliationPanelProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [result, setResult] = useState<ReconciliationRunResult | null>(null);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    const flagOn = await isReconciliationEnabledAction();
    setEnabled(flagOn);
    if (!flagOn) return;
    setRunning(true);
    try {
      const fresh = await runReconciliationAction(engagementId);
      setResult(fresh);
    } finally {
      setRunning(false);
    }
  }, [engagementId]);

  useEffect(() => {
    load();
  }, [load]);

  if (enabled === false) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-xs text-muted-foreground">
          Factory reconciliation off — set{" "}
          <code>FF_AUDIT_RECONCILIATION=true</code> to enable TB↔LS↔FS tie-out
          checks.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader className="border-b pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <GitCompare className="size-4 text-blue-600" />
              Factory Reconciliation
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              TB ↔ Lead Schedules ↔ FS · A = L + E · IS → Equity
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={running}>
            {running ? (
              <Loader2 className="size-3 me-1 animate-spin" />
            ) : (
              <RefreshCw className="size-3 me-1" />
            )}
            تشغيل المطابقة
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        {result && (
          <>
            <Badge variant={result.passed ? "default" : "destructive"}>
              {result.passed ? "PASS" : `${result.failedCount} FAILED`}
            </Badge>
            <ul className="text-xs space-y-1">
              {result.checks.map((c) => (
                <li
                  key={c.code}
                  className={
                    c.passed ? "text-green-700" : "text-red-700 font-medium"
                  }
                >
                  {c.code}: {c.messageAr}
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
