"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";

export function IcpPanelActions({
  accountId,
  loading,
  reviewLoading,
  reviewed,
  agentGenerated,
  onRecalculate,
  onReviewToggle,
}: {
  accountId: string;
  loading: boolean;
  reviewLoading: boolean;
  reviewed: boolean;
  agentGenerated: boolean;
  onRecalculate: () => void;
  onReviewToggle: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-t pt-3">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={loading || reviewLoading}
        onClick={onRecalculate}
        className="gap-1"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        Recalculate (rules)
      </Button>

      {agentGenerated ? (
        <div className="flex items-center gap-2">
          <Checkbox
            id={`icp-reviewed-${accountId}`}
            checked={reviewed}
            disabled={reviewLoading || loading}
            onCheckedChange={(checked) => onReviewToggle(checked === true)}
          />
          <Label
            htmlFor={`icp-reviewed-${accountId}`}
            className="text-sm font-normal cursor-pointer"
          >
            Mark reviewed
          </Label>
        </div>
      ) : null}
    </div>
  );
}
