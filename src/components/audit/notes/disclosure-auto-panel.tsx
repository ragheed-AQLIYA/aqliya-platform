"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Loader2, RefreshCw } from "lucide-react";
import {
  isDisclosureAutoEnabledAction,
  runDisclosureAutoAction,
} from "@/actions/audit-disclosure-auto-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DisclosureAutoRunResult } from "@/lib/audit/notes/disclosure-engine-types";

interface DisclosureAutoPanelProps {
  engagementId: string;
  onNotesChanged?: () => void;
}

export function DisclosureAutoPanel({
  engagementId,
  onNotesChanged,
}: DisclosureAutoPanelProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [result, setResult] = useState<DisclosureAutoRunResult | null>(null);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    const flagOn = await isDisclosureAutoEnabledAction();
    setEnabled(flagOn);
    if (!flagOn) return;
    setRunning(true);
    try {
      const fresh = await runDisclosureAutoAction(engagementId);
      setResult(fresh);
      if (fresh && onNotesChanged) onNotesChanged();
    } finally {
      setRunning(false);
    }
  }, [engagementId, onNotesChanged]);

  useEffect(() => {
    load();
  }, [load]);

  if (enabled === false) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-xs text-muted-foreground">
          Disclosure auto engine off — set{" "}
          <code>FF_AUDIT_DISCLOSURE_AUTO=true</code> (requires IFRS and/or
          SOCPA rules flags for triggers).
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-teal-200">
      <CardHeader className="border-b border-teal-100 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-teal-600" />
            Disclosure Auto Engine
            <Badge
              variant="outline"
              className="bg-teal-50 text-teal-700 border-teal-200 text-[10px]"
            >
              Phase 8
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={running}
            className="h-7 gap-1 text-xs"
          >
            {running ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Run
          </Button>
        </div>
        <CardDescription className="text-[10px] text-muted-foreground">
          Materializes IFRS/SOCPA rule triggers into draft disclosure notes.
          Reviewed or approved notes are never overwritten.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 text-xs space-y-2">
        {running && !result && (
          <p className="text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Collecting triggers and drafting notes…
          </p>
        )}
        {result && (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <dt className="text-muted-foreground">Triggers</dt>
              <dd className="font-medium">
                {result.triggersDeduped} / {result.triggersCollected}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium text-teal-700">
                {result.notesCreated}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd className="font-medium">{result.notesUpdated}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Skipped</dt>
              <dd className="font-medium">{result.notesSkipped}</dd>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-muted-foreground">Last run</dt>
              <dd className="font-mono text-[10px]">{result.runAt}</dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
