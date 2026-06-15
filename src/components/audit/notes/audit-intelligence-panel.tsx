"use client";

import { useState } from "react";
import { Bot, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { runAuditIntelligenceAction } from "@/actions/audit-intelligence-actions";
import type { AuditIntelligenceRunResult } from "@/lib/audit/intelligence/types";

interface AuditIntelligencePanelProps {
  engagementId: string;
  onNotesChanged?: () => void;
}

export function AuditIntelligencePanel({
  engagementId,
  onNotesChanged,
}: AuditIntelligencePanelProps) {
  const [result, setResult] = useState<AuditIntelligenceRunResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    try {
      const fresh = await runAuditIntelligenceAction(engagementId);
      setResult(fresh);
      if (fresh.notesEnriched > 0) onNotesChanged?.();
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card className="border-violet-200">
      <CardHeader className="border-b pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="size-4 text-violet-600" />
              Audit Intelligence — Disclosure Enrichment
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              يُثري مسودات الإيضاح ذات rule citations عبر inference محكوم — مراجعة بشرية إلزامية
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRun} disabled={running}>
            {running ? (
              <Loader2 className="size-3 me-1 animate-spin" />
            ) : (
              <RefreshCw className="size-3 me-1" />
            )}
            تشغيل الإثراء
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <Sparkles className="size-4 shrink-0 text-violet-500" />
          AI assists. Humans decide. — لا يُعتمد الإثراء دون موافقة المراجع.
        </p>
        {result && (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{result.notesScanned} scanned</Badge>
              <Badge variant="outline" className="bg-green-50">
                {result.notesEnriched} enriched
              </Badge>
              <Badge variant="outline">{result.notesSkipped} skipped</Badge>
            </div>
            {result.enrichments.length > 0 && (
              <ul className="text-sm space-y-1 border-t pt-2 max-h-40 overflow-y-auto">
                {result.enrichments.map((e) => (
                  <li key={e.noteId}>
                    {e.noteTitle}{" "}
                    <span className="text-muted-foreground text-xs">({e.providerId})</span>
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
