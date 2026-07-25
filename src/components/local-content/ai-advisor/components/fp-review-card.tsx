"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PendingFlag } from "../types";

function riskBadgeVariant(level: string): "destructive" | "default" | "secondary" {
  if (level === "high") return "destructive";
  if (level === "medium") return "default";
  return "secondary";
}

function riskLabel(level: string): string {
  if (level === "high") return "عالية / High";
  if (level === "medium") return "متوسطة / Medium";
  return "منخفضة / Low";
}

export function FpReviewCard({
  flag,
  onReview,
}: {
  flag: PendingFlag;
  onReview: (id: string, decision: "confirmed" | "rejected") => void;
}) {
  const [notes, setNotes] = useState("");

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                {flag.accountCode}
              </code>
              <span className="text-muted-foreground font-normal text-sm">
                {flag.accountName}
              </span>
            </CardTitle>
            <CardDescription className="mt-1">
              <span className="font-medium">الخط / Line:</span> {flag.workbookLineCode}
            </CardDescription>
          </div>
          <Badge variant={riskBadgeVariant(flag.riskLevel)}>
            {riskLabel(flag.riskLevel)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{flag.riskReason}</p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="ملاحظات المراجعة..."
            className="flex-1 rounded-md border px-3 py-1.5 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button size="sm" variant="outline" onClick={() => onReview(flag.id, "confirmed")}>
            ✅ تأكيد FP
          </Button>
          <Button size="sm" onClick={() => onReview(flag.id, "rejected")}>
            ❌ رفض FP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
