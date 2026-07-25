"use client";

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ListChecks,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PilotSignoff } from "@/types/audit";
import { signoffItems } from "@/components/audit/pilot/use-pilot-page";

interface SignoffChecklistProps {
  signoffs: PilotSignoff[];
  allApproved: boolean;
  onToggleSignoff: (item: string) => void;
  title: string;
  byLabel: string;
  undoLabel: string;
  approveLabel: string;
  allCompleteLabel: string;
  itemsRemainingLabel: string;
}

export function SignoffChecklist({
  signoffs,
  allApproved,
  onToggleSignoff,
  title,
  byLabel,
  undoLabel,
  approveLabel,
  allCompleteLabel,
  itemsRemainingLabel,
}: SignoffChecklistProps) {
  return (
    <Card>
      <CardHeader className="border-b px-3 sm:px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold break-words">
          <ListChecks className="size-4 shrink-0" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 px-3 sm:px-4">
        <div className="space-y-2">
          {signoffItems.map((item) => {
            const signoff = signoffs.find((s) => s.checklistItem === item);
            const isApproved = signoff?.status === "approved";
            return (
              <div
                key={item}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 py-1.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isApproved ? (
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="size-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-sm break-words">{item}</span>
                  {signoff?.signedBy && (
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {byLabel} {signoff.signedBy}
                    </span>
                  )}
                </div>
                <Button
                  variant={isApproved ? "outline" : "default"}
                  size="sm"
                  className="self-start sm:self-auto"
                  onClick={() => onToggleSignoff(item)}
                >
                  {isApproved ? undoLabel : approveLabel}
                </Button>
              </div>
            );
          })}
        </div>
        <div className="mt-3 p-2 rounded border text-center text-sm">
          {allApproved ? (
            <span className="text-emerald-600 font-semibold flex items-center justify-center gap-1 break-words">
              <CheckCircle2 className="size-4 shrink-0" /> {allCompleteLabel}
            </span>
          ) : (
            <span className="text-amber-600 flex items-center justify-center gap-1 break-words">
              <AlertTriangle className="size-4 shrink-0" />{" "}
              {signoffItems.length -
                signoffs.filter((s) => s.status === "approved").length}{" "}
              {itemsRemainingLabel}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
