"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PendingSuggestion } from "../types";

export function SuggestionCard({
  suggestion,
  onReview,
}: {
  suggestion: PendingSuggestion;
  onReview: (id: string, decision: "approved" | "rejected") => void;
}) {
  const [notes, setNotes] = useState("");

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                {suggestion.workbookLineCode}
              </code>
              {" — "}
              <span className="text-sm font-normal">
                تحسين النمط / Pattern Improvement
              </span>
            </CardTitle>
            <CardDescription className="mt-1">
              الثقة: {suggestion.confidence}%
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {suggestion.confidence >= 70
              ? "موصى به / Recommended"
              : "اقتراح / Suggestion"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            النمط الحالي / Current Pattern:
          </p>
          <pre className="rounded bg-muted p-2 text-xs overflow-x-auto whitespace-pre-wrap max-h-20 overflow-y-auto">
            {suggestion.currentPattern}
          </pre>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            النمط المقترح / Suggested Pattern:
          </p>
          <pre className="rounded bg-blue-50 dark:bg-blue-950 p-2 text-xs overflow-x-auto whitespace-pre-wrap max-h-20 overflow-y-auto">
            {suggestion.suggestedPattern}
          </pre>
        </div>
        <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="ملاحظات المراجعة..."
            className="flex-1 rounded-md border px-3 py-1.5 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button size="sm" variant="outline" onClick={() => onReview(suggestion.id, "rejected")}>
            ❌ رفض / Reject
          </Button>
          <Button size="sm" onClick={() => onReview(suggestion.id, "approved")}>
            ✅ اعتماد / Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
