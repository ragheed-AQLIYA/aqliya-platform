"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { Brain, Activity, AlertTriangle, Info, Eye } from "lucide-react";
import { batchAcknowledgeSignalsAction } from "@/actions/decision-signals-alerts";
import Link from "next/link";

type Signal = {
  id: string;
  decisionId: string;
  source: string;
  signalType: string;
  description: string;
  severity: string;
  status: string;
  generatedBy: string;
  createdAt: Date;
  decision: { id: string; title: string; status: string };
};

function getSeverityVariant(severity: string) {
  switch (severity) {
    case "HIGH": return "destructive";
    case "MEDIUM": return "default";
    case "LOW": return "secondary";
    default: return "outline";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "NEW": return "جديد";
    case "ACKNOWLEDGED": return "مؤكّد";
    default: return status;
  }
}

export function SignalsDashboardClient({ signals }: { signals: Signal[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);

  const toggleId = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === signals.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(signals.map((s) => s.id)));
    }
  }, [signals, selectedIds]);

  async function handleBatchAcknowledge() {
    if (selectedIds.size === 0) return;
    setPending(true);
    await batchAcknowledgeSignalsAction([...selectedIds]);
    setSelectedIds(new Set());
    setPending(false);
    router.refresh();
  }

  const newSignals = signals.filter((s) => s.status === "NEW");
  const acknowledgedSignals = signals.filter((s) => s.status === "ACKNOWLEDGED");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" /> الإجمالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{signals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> جديدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{newSignals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" /> مؤكّدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{acknowledgedSignals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-500" /> مصادر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{new Set(signals.map((s) => s.source)).size}</p>
          </CardContent>
        </Card>
      </div>

      {/* Batch Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} محدّد
          </span>
          <Button
            size="sm"
            disabled={pending}
            onClick={handleBatchAcknowledge}
          >
            {pending ? "جاري التحديث…" : "تأكيد المحدّد"}
          </Button>
        </div>
      )}

      {/* Signals List */}
      {signals.length === 0 ? (
        <EnterpriseCard>
          <EnterpriseCardContent className="py-12">
            <div className="text-center">
              <Brain className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-base font-semibold text-foreground">
                لا توجد إشارات مراقبة
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                الإشارات تُنشأ تلقائياً بعد اعتماد القرار من خلال تحليل المخاطر.
              </p>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      ) : (
        <div className="space-y-2">
          {/* Select All */}
          <div className="flex items-center gap-2 px-1">
            <Checkbox
              checked={selectedIds.size === signals.length}
              onCheckedChange={toggleAll}
            />
            <span className="text-xs text-muted-foreground">تحديد الكل</span>
          </div>

          {signals.map((signal) => (
            <div
              key={signal.id}
              className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30"
            >
              <Checkbox
                checked={selectedIds.has(signal.id)}
                onCheckedChange={() => toggleId(signal.id)}
                className="mt-1"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getSeverityVariant(signal.severity)} className="shrink-0">
                    {signal.severity}
                  </Badge>
                  <Badge variant={signal.status === "NEW" ? "default" : "secondary"}>
                    {getStatusLabel(signal.status)}
                  </Badge>
                  <Badge variant="outline">{signal.source}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(signal.createdAt).toLocaleDateString("ar-SA")}
                  </span>
                </div>
                <p className="mt-1 text-sm">{signal.description}</p>
                <Link
                  href={`/decisions/${signal.decisionId}`}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {signal.decision.title}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
