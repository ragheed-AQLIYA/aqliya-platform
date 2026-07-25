"use client";

import type { NextWorkflowAction } from "@/lib/audit/workflow-next-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, ArrowRight } from "lucide-react";
import Link from "next/link";

interface NextStepCardProps {
  nextAction: NextWorkflowAction;
}

export function NextStepCard({ nextAction }: NextStepCardProps) {
  return (
    <Card
      className={
        nextAction.urgent
          ? "border-destructive/50 bg-destructive/5"
          : "border-primary/30 bg-primary/5"
      }
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Compass className="h-4 w-4 text-primary" />
          الخطوة التالية
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{nextAction.label}</p>
          {nextAction.reason && (
            <p className="text-xs text-muted-foreground">
              {nextAction.reason}
            </p>
          )}
        </div>
        <Link href={nextAction.href}>
          <Button
            size="sm"
            variant={nextAction.urgent ? "destructive" : "default"}
          >
            متابعة
            <ArrowRight className="mr-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
