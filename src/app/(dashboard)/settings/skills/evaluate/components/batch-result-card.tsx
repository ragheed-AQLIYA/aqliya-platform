"use client";

import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { BarChart3, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { BatchEvalResult } from "./types";
import { scoreColor, formatDuration } from "./utils";

interface BatchResultCardProps {
  result: BatchEvalResult;
  onRerunSkill: (skillId: string) => void;
  evalRunning: boolean;
  currentSkillId: string | null;
}

export function BatchResultCard({
  result,
  onRerunSkill,
  evalRunning,
  currentSkillId,
}: BatchResultCardProps) {
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5" />
          نتيجة التقييم الشامل
        </CardTitle>
        <CardDescription>
          {result.totalSkills} مهارة — {result.passed} ناجح / {result.failed} راسب —{" "}
          {formatDuration(result.durationMs)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div
            className={`text-3xl font-bold ${
              result.overallPassRate >= 0.7
                ? "text-green-600"
                : result.overallPassRate >= 0.4
                  ? "text-amber-600"
                  : "text-red-600"
            }`}
          >
            {pct(result.overallPassRate)}
          </div>
          <div className="text-muted-foreground text-sm">نسبة النجاح الإجمالية</div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المهارة</TableHead>
              <TableHead className="text-right">الدرجة</TableHead>
              <TableHead className="text-right">الحد</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">عيّنات</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.results.map((r) => (
              <TableRow key={r.skillId}>
                <TableCell className="font-medium">
                  {r.skillName}
                  <div className="text-muted-foreground text-xs">{r.skillId}</div>
                </TableCell>
                <TableCell className={scoreColor(r.overallScore, r.passThreshold)}>
                  {pct(r.overallScore)}
                </TableCell>
                <TableCell className="text-muted-foreground">{pct(r.passThreshold)}</TableCell>
                <TableCell>
                  {r.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {r.samples.length}/{r.sampleCount}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={evalRunning}
                    onClick={() => onRerunSkill(r.skillId)}
                  >
                    {evalRunning && currentSkillId === r.skillId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "إعادة"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {result.results.some((r) => r.errors.length > 0) && (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {result.results
              .filter((r) => r.errors.length > 0)
              .map((r) => (
                <div key={r.skillId}>
                  ⚠ {r.skillName}: {r.errors.join("; ")}
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
