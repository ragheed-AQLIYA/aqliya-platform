"use client";

import { Bug, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductionBlocker } from "@/types/audit";
import { severityColors, statusColors } from "./feedback-item";

interface ProductionBlockersProps {
  blockers: ProductionBlocker[];
  openBlockers: number;
  expandedId: string | null;
  onToggleExpanded: (id: string | null) => void;
  onUpdateStatus: (id: string, status: string) => void;
  title: string;
  openLabel: string;
  noBlockersLabel: string;
  beforeLabel: string;
  ownerLabel: string;
  planLabel: string;
  inProgressLabel: string;
  resolveLabel: string;
}

export function ProductionBlockers({
  blockers,
  openBlockers,
  expandedId,
  onToggleExpanded,
  onUpdateStatus,
  title,
  openLabel,
  noBlockersLabel,
  beforeLabel,
  ownerLabel,
  planLabel,
  inProgressLabel,
  resolveLabel,
}: ProductionBlockersProps) {
  return (
    <Card>
      <CardHeader className="border-b px-3 sm:px-4 py-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-sm font-semibold break-words">
          <Bug className="size-4 shrink-0" />
          {title}
          {openBlockers > 0 && (
            <Badge
              variant="outline"
              className="bg-red-100 text-red-700 text-[10px] shrink-0"
            >
              {openBlockers} {openLabel}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 px-3 sm:px-4">
        {blockers.length === 0 ? (
          <div className="py-4 text-sm text-muted-foreground break-words">
            {noBlockersLabel}
          </div>
        ) : (
          <div className="divide-y">
            {blockers.map((b) => (
              <div key={b.id} className="py-2.5">
                <div
                  className="flex items-start justify-between cursor-pointer gap-2"
                  onClick={() =>
                    onToggleExpanded(expandedId === b.id ? null : b.id)
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-medium break-words">
                        {b.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${severityColors[b.severity] ?? ""}`}
                      >
                        {b.severity}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-gray-50 shrink-0"
                      >
                        {b.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${statusColors[b.status] ?? ""}`}
                      >
                        {b.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] shrink-0"
                      >
                        {beforeLabel} {b.requiredBefore}
                      </Badge>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {expandedId === b.id ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </div>
                </div>
                {expandedId === b.id && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm break-words">{b.description}</p>
                    {b.owner && (
                      <p className="text-xs break-words">
                        <span className="font-medium">{ownerLabel}</span>{" "}
                        {b.owner}
                      </p>
                    )}
                    {b.resolutionPlan && (
                      <p className="text-xs break-words">
                        <span className="font-medium">{planLabel}</span>{" "}
                        {b.resolutionPlan}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-1">
                      {b.status === "open" && (
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-[10px]"
                          onClick={() =>
                            onUpdateStatus(b.id, "in_progress")
                          }
                        >
                          {inProgressLabel}
                        </Button>
                      )}
                      {b.status === "in_progress" && (
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-[10px]"
                          onClick={() =>
                            onUpdateStatus(b.id, "resolved")
                          }
                        >
                          {resolveLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
