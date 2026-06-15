"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Camera, GitBranch, Loader2, RefreshCw } from "lucide-react";
import {
  captureGraphSnapshotAction,
  getReportingGraphAction,
  isMindMapEnabledAction,
  listGraphSnapshotsAction,
} from "@/actions/audit-factory-map-actions";
import { FactoryMindMap } from "@/components/audit/factory-map/factory-mind-map";
import { WorkflowGuard } from "@/components/audit/layout/workflow-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReportingGraph } from "@/lib/audit/reporting-graph/types";

export default function FactoryMapPage() {
  const params = useParams();
  const engagementId = params.engagementId as string;

  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [graph, setGraph] = useState<ReportingGraph | null>(null);
  const [snapshots, setSnapshots] = useState<
    Array<{
      id: string;
      milestone: string;
      capturedAt: string;
      stats: ReportingGraph["stats"];
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const flagOn = await isMindMapEnabledAction();
      setEnabled(flagOn);
      if (!flagOn) {
        setGraph(null);
        setSnapshots([]);
        return;
      }
      const [g, snaps] = await Promise.all([
        getReportingGraphAction(engagementId),
        listGraphSnapshotsAction(engagementId),
      ]);
      setGraph(g);
      setSnapshots(snaps);
    } finally {
      setLoading(false);
    }
  }, [engagementId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCapture = async () => {
    setCapturing(true);
    try {
      await captureGraphSnapshotAction(engagementId);
      await load();
    } finally {
      setCapturing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (enabled === false) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center space-y-2">
          <GitBranch className="size-8 mx-auto text-muted-foreground" />
          <h2 className="text-lg font-semibold">خريطة المصنع غير مفعّلة</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            فعّل العلم <code className="text-xs">FF_AUDIT_MIND_MAP=true</code>{" "}
            لعرض مسار TB → Mapping → FS → الإيضاحات.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <WorkflowGuard engagementId={engagementId} tabKey="factory-map">
      <div className="space-y-4">
        <Card>
          <CardHeader className="border-b pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <GitBranch className="size-4 text-primary" />
                  خريطة مصنع القوائم المالية
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Mind Map — قراءة فقط من بيانات الارتباط الحالية (ميزان → تعيين →
                  قوائم → إيضاحات)
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                  <RefreshCw className="size-3 me-1" />
                  تحديث
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCapture}
                  disabled={capturing || !graph}
                >
                  {capturing ? (
                    <Loader2 className="size-3 me-1 animate-spin" />
                  ) : (
                    <Camera className="size-3 me-1" />
                  )}
                  لقطة يدوية
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {graph ? (
              <FactoryMindMap graph={graph} />
            ) : (
              <p className="text-sm text-muted-foreground">
                لا توجد بيانات كافية لبناء الخريطة بعد.
              </p>
            )}
          </CardContent>
        </Card>

        {snapshots.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">لقطات الرسم البياني</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {snapshots.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-xs border rounded-md px-3 py-2"
                >
                  <span>{s.capturedAt}</span>
                  <Badge variant="outline">{s.milestone}</Badge>
                  <span className="text-muted-foreground">
                    {s.stats.edges} edges · {s.stats.notes} notes
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </WorkflowGuard>
  );
}
