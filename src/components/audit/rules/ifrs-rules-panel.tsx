"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Loader2, RefreshCw } from "lucide-react";
import {
  isIfrsRulesEnabledAction,
  runIfrsRulesAction,
} from "@/actions/audit-ifrs-rules-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { IfrsRulesRunResult } from "@/lib/audit/rules/types";

interface IfrsRulesPanelProps {
  engagementId: string;
}

export function IfrsRulesPanel({ engagementId }: IfrsRulesPanelProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [result, setResult] = useState<IfrsRulesRunResult | null>(null);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    const flagOn = await isIfrsRulesEnabledAction();
    setEnabled(flagOn);
    if (!flagOn) return;
    setRunning(true);
    try {
      const fresh = await runIfrsRulesAction(engagementId);
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
          IFRS rules engine off — set{" "}
          <code>FF_AUDIT_IFRS_RULES=true</code> to evaluate knowledge-foundation
          IFRS packs.
        </CardContent>
      </Card>
    );
  }

  const failed = result?.evaluations.filter((e) => e.status === "fail") ?? [];
  const warnings =
    result?.evaluations.filter((e) => e.status === "warning") ?? [];

  return (
    <Card className="border-violet-200">
      <CardHeader className="border-b pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="size-4 text-violet-600" />
              IFRS Rules Engine
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Knowledge-foundation IFRS runtime · citations + disclosure triggers
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={running}>
            {running ? (
              <Loader2 className="size-3 me-1 animate-spin" />
            ) : (
              <RefreshCw className="size-3 me-1" />
            )}
            تشغيل IFRS
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {result && (
          <>
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
                  {result.disclosureTriggers.length} إيضاح مقترح
                </Badge>
              )}
            </div>
            {failed.length > 0 && (
              <ul className="text-xs space-y-1 text-red-700">
                {failed.slice(0, 5).map((e) => (
                  <li key={e.ruleId}>
                    {e.standardCode} {e.paragraphReference}: {e.messageAr}
                  </li>
                ))}
              </ul>
            )}
            {warnings.length > 0 && (
              <ul className="text-xs space-y-1 text-amber-700">
                {warnings.slice(0, 5).map((e) => (
                  <li key={e.ruleId}>
                    {e.standardCode}: {e.messageAr}
                  </li>
                ))}
              </ul>
            )}
            {result.disclosureTriggers.length > 0 && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                <p className="font-medium mb-1">Disclosure triggers</p>
                <ul className="space-y-0.5">
                  {result.disclosureTriggers.slice(0, 4).map((t) => (
                    <li key={`${t.ruleId}-${t.suggestedTitle}`}>
                      {t.suggestedTitle} ({t.standardCode})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
