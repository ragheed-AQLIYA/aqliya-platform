"use client";

import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Hold } from "./types";

type Props = { holds: Hold[]; onRemove: (holdId: string) => void };

export function HoldList({ holds, onRemove }: Props) {
  if (holds.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        لا توجد تعليقات نشطة
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {holds.map((hold) => (
        <div
          key={hold.id}
          className="flex items-start justify-between gap-2 rounded-md border p-3"
        >
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{hold.recordType}</span>
              <span className="text-muted-foreground text-xs font-mono">
                {hold.recordId.slice(0, 12)}...
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hold.reason}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(hold.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
