"use client";

import { Database, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Policy } from "./types";
import { actionLabel, actionVariant, daysLabel, getModelLabel } from "./utils";

type Props = {
  policy: Policy;
  onEdit: (policy: Policy) => void;
  onReset: (modelName: string) => void;
};

export function PolicyViewCard({ policy, onEdit, onReset }: Props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {getModelLabel(policy.modelName)}
            </span>
            {policy.overridden && (
              <Badge
                variant="outline"
                className="text-[10px] bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200"
              >
                مخصص
              </Badge>
            )}
            {!policy.enabled && (
              <Badge
                variant="outline"
                className="text-[10px] bg-gray-100 text-gray-600"
              >
                معطل
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{daysLabel(policy.retentionDays)}</span>
            <Badge variant={actionVariant(policy.action)} className="text-[10px]">
              {actionLabel(policy.action)}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => onEdit(policy)}>
          تعديل
        </Button>
        {policy.overridden && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReset(policy.modelName)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
