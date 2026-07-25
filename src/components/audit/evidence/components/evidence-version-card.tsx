"use client";

import {
  ChevronDown,
  ChevronRight,
  GitCompareArrows,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import type { EvidenceVersion } from "./use-evidence-history";

interface EvidenceVersionCardProps {
  version: EvidenceVersion;
  isExpanded: boolean;
  isReverting: boolean;
  onToggle: () => void;
  onCompare: () => void;
  onRevert: () => void;
}

export function EvidenceVersionCard({
  version,
  isExpanded,
  isReverting,
  onToggle,
  onCompare,
  onRevert,
}: EvidenceVersionCardProps) {
  const changes = version.changes as Record<string, string>;

  return (
    <Card
      className={`border ${version.versionNumber === 1 ? "border-blue-200" : "border-border/60"}`}
    >
      <CardHeader className="cursor-pointer px-4 py-3" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <Badge variant="outline">
              {"الإصدار " + version.versionNumber}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {version.createdByName || version.createdById || "نظام"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {new Date(version.createdAt).toLocaleDateString("ar-SA", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {version.versionNumber > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={isReverting}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevert();
                  }}
                  title="استعادة هذا الإصدار"
                >
                  {isReverting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompare();
                  }}
                  title="مقارنة إصدارين"
                >
                  <GitCompareArrows className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
        {version.changeDescription && (
          <p className="mt-1 text-xs text-muted-foreground px-6">
            {version.changeDescription}
          </p>
        )}
      </CardHeader>
      {isExpanded && (
        <CardContent className="border-t px-4 py-3">
          <div className="space-y-1 max-h-48 overflow-y-auto text-xs font-mono">
            {Object.entries(changes).map(([key, val]) => (
              <div key={key} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{key}</span>
                <span>{String(val ?? "—")}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
