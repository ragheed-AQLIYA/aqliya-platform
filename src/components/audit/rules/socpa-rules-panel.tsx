"use client";

import { useCallback, useEffect, useState } from "react";
import { Flag, Loader2, RefreshCw } from "lucide-react";
import {
  isSocpaRulesEnabledAction,
  runSocpaRulesAction,
} from "@/actions/audit-socpa-rules-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SocpaRulesRunResult } from "@/lib/audit/rules/types";

interface SocpaRulesPanelProps {
  engagementId: string;
}

export function SocpaRulesPanel({ engagementId }: SocpaRulesPanelProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [result, setResult] = useState<SocpaRulesRunResult | null>(null);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    const flagOn = await isSocpaRulesEnabledAction();
    setEnabled(flagOn);
    if (!flagOn) return;
    setRunning(true);
    try {
      const fresh = await runSocpaRulesAction(engagementId);
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
          SOCPA rules engine off — set{" "}
          <code>FF_AUDIT_SOCPA_RULES=true</code> for Saudi/SAR overlay checks.
        </CardContent>
      </Card>
    );
  }

  const failed = result?.evaluations.filter((e) => e.status === "fail") ?? [];
  const warnings =
    result?.evaluations.filter((e) => e.status === "warning") ?? [];

  return (
    <Card className="border-emerald-200">
      <CardHeader className="border-b pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Flag className="size-4 text-emerald-700" />
              SOCPA Rules Engine
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Saudi jurisdiction overlay · zakat/tax · IFRS adoption
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={running}>
            {running ? (
              <Loader2 className="size-3 me-1 animate-spin" />
            ) : (
              <RefreshCw className="size-3 me-1" />
            )}
            تشغيل SOCPA
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {result && (
          <>
            {!result.jurisdictionApplicable && (
              <p className="text-xs text-muted-foreground">
                خارج الاختصاص السعودي — جميع قواعد SOCPA متخطاة.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant={result.passed ? "default" : "destructive"}>
                {result.ruleCount} rules · {result.failedCount} fail
              </Badge>
              {result.warningCount > 0 && (
                <Badge variant="outline" className="text-amber-700">
                  {result.warningCount} تحذير
                </Badge>
              )}
              {result.disclosureTriggers.length > 0 && (
                <Badge variant="outline">
                  {result.disclosureTriggers.length} إيضاح زكاة/ضريبة
                </Badge>
              )}
            </div>
            {failed.length > 0 && (
              <ul className="text-xs space-y-1 text-red-700">
                {failed.slice(0, 4).map((e) => (
                  <li key={e.ruleId}>
                    {e.standardCode}: {e.messageAr}
                  </li>
                ))}
              </ul>
            )}
            {warnings.length > 0 && (
              <ul className="text-xs space-y-1 text-amber-700">
                {warnings.slice(0, 4).map((e) => (
                  <li key={e.ruleId}>
                    {e.standardCode}: {e.messageAr}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
