"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { EvaluationResult } from "./types";
import { scoreColor, formatDuration } from "./utils";

export function SingleResultCard({ result }: { result: EvaluationResult }) {
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const passed = result.passed;

  return (
    <Card className={passed ? "border-green-200" : "border-red-200"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {passed ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          {result.skillName}
          <Badge variant="outline" className="mr-2 text-xs">
            {result.skillVersion}
          </Badge>
        </CardTitle>
        <CardDescription>
          {result.datasetName} — {result.sampleCount} عينة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className={`text-3xl font-bold ${scoreColor(result.overallScore, result.passThreshold)}`}>
            {pct(result.overallScore)}
          </div>
          <div className="text-muted-foreground text-sm">
            الحد الأدنى: {pct(result.passThreshold)} —{" "}
            {result.durationMs}ms
          </div>
        </div>

        {result.criterionBreakdown.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">المعايير</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المعيار</TableHead>
                  <TableHead className="text-right">الدرجة</TableHead>
                  <TableHead className="text-right">الوزن</TableHead>
                  <TableHead className="text-right">الحد</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.criterionBreakdown.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell className={scoreColor(c.score, c.threshold)}>
                      {pct(c.score)}
                    </TableCell>
                    <TableCell>{pct(c.weight)}</TableCell>
                    <TableCell>{pct(c.threshold)}</TableCell>
                    <TableCell>
                      {c.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {result.samples.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">
              العينات ({result.samples.length})
            </h4>
            <div className="space-y-2">
              {result.samples.map((s) => (
                <div
                  key={s.sampleId}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <div>
                    <span className="font-medium">{s.description}</span>
                    <span className="text-muted-foreground mr-2 text-xs">
                      {s.sampleId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={scoreColor(s.overallScore, 0.5)}>
                      {pct(s.overallScore)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDuration(s.durationMs)}
                    </span>
                    {s.error && (
                      <span className="text-red-500 text-xs" title={s.error}>
                        <AlertCircle className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.errors.length > 0 && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {result.errors.map((e, i) => (
              <div key={i}>⚠ {e}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
