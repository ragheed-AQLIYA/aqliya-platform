"use client";

import type { WorkflowContext } from "@/lib/audit/workflow-gating";
import { evaluateTabGate } from "@/lib/audit/workflow-gating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileSpreadsheet,
  Network,
  FileSearch,
  FileText,
  Scale,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Lock,
} from "lucide-react";
import Link from "next/link";

function engagementHref(engagementId: string, step: string) {
  return `/audit/engagements/${engagementId}/${step}`;
}

const workflowSteps = [
  { key: "trial-balance", label: "ميزان المراجعة", icon: FileSpreadsheet },
  { key: "mapping", label: "تعيين الحسابات", icon: Network },
  { key: "validation", label: "التحقق", icon: Network },
  { key: "statements", label: "القوائم المالية", icon: FileText },
  { key: "notes", label: "الإيضاحات", icon: FileText },
  { key: "evidence", label: "الأدلة", icon: FileSearch },
  { key: "findings", label: "النتائج", icon: Scale },
  { key: "recommendations", label: "التوصيات", icon: FileText },
  { key: "review", label: "المراجعة", icon: MessageSquare },
  { key: "approval", label: "الاعتماد", icon: CheckCircle },
  { key: "publication", label: "النشر", icon: FileText },
];

interface WorkflowStepsCardProps {
  engagementId: string;
  workflowContext: WorkflowContext | null;
}

export function WorkflowStepsCard({
  engagementId,
  workflowContext,
}: WorkflowStepsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          خطوات سير العمل
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-11">
          {workflowSteps.map((step) => {
            const gate = workflowContext
              ? evaluateTabGate(step.key, workflowContext)
              : { locked: false as const };
            const locked = gate.locked;

            if (locked) {
              return (
                <div
                  key={step.key}
                  title={gate.reason}
                  className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-4 text-center opacity-60 cursor-not-allowed"
                >
                  <Lock className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs font-medium">{step.label}</span>
                  {gate.reason && (
                    <span className="text-[10px] text-muted-foreground line-clamp-2">
                      {gate.reason}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={step.key}
                href={engagementHref(engagementId, step.key)}
                className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-accent"
              >
                <step.icon className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs font-medium">{step.label}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
