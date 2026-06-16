"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ScrollText,
  BarChart3,
  Play,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

// ─── Types ───

interface SkillInfo {
  skillId: string;
  skillName: string;
  version: string;
  level: number;
  category: string;
  description: string;
  hasDataset: boolean;
  criteriaCount: number;
}

interface ApiSkillListResponse {
  skills: SkillInfo[];
  summary: { total: number; withDatasets: number; withCriteria: number; byLevel: Record<number, number> };
  timestamp: string;
}

interface CriterionBreakdown {
  name: string;
  score: number;
  weight: number;
  threshold: number;
  passed: boolean;
}

interface EvaluationSampleResult {
  sampleId: string;
  description: string;
  status: string;
  overallScore: number;
  durationMs: number;
  error?: string;
}

interface EvaluationResult {
  skillId: string;
  skillName: string;
  skillVersion: string;
  datasetName: string;
  sampleCount: number;
  timestamp: string;
  overallScore: number;
  passThreshold: number;
  passed: boolean;
  criterionBreakdown: CriterionBreakdown[];
  samples: EvaluationSampleResult[];
  errors: string[];
  durationMs: number;
}

interface ApiEvalResponse {
  type: "single" | "batch";
  level?: number | string;
  markdown: string;
  result: EvaluationResult | BatchEvalResult;
  timestamp: string;
}

interface BatchEvalResult {
  timestamp: string;
  totalSkills: number;
  passed: number;
  failed: number;
  errored: number;
  overallPassRate: number;
  results: EvaluationResult[];
  durationMs: number;
}

// ─── Helpers ───

function scoreColor(score: number, threshold: number): string {
  if (score >= threshold) return "text-green-600 dark:text-green-400";
  if (score >= threshold * 0.7) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function levelLabel(level: number): string {
  return `L${level}`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ─── Component ───

export default function SkillsEvaluationPage() {
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [summary, setSummary] = useState<ApiSkillListResponse["summary"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Evaluation state
  const [evalRunning, setEvalRunning] = useState(false);
  const [evalSkillId, setEvalSkillId] = useState<string | null>(null);
  const [evalResults, setEvalResults] = useState<ApiEvalResponse | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Fetch skills on mount
  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/skills/evaluate");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiSkillListResponse = await res.json();
      setSkills(data.skills);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load skills");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Run evaluation
  const runEvaluation = useCallback(
    async (skillId?: string, level?: number) => {
      setEvalRunning(true);
      setEvalError(null);
      setEvalResults(null);

      try {
        const body: Record<string, unknown> = {};
        if (skillId) body.skillId = skillId;
        else if (level !== undefined) body.level = level;
        else body.level = "all";

        const res = await fetch("/api/skills/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          throw new Error(errData.error ?? `HTTP ${res.status}`);
        }

        const data: ApiEvalResponse = await res.json();
        setEvalResults(data);
      } catch (err) {
        setEvalError(err instanceof Error ? err.message : "Evaluation failed");
      } finally {
        setEvalRunning(false);
        setEvalSkillId(null);
      }
    },
    [],
  );

  // ─── Render ───

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <BarChart3 className="h-6 w-6" />
            تقييم المهارات
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Skills Evaluation Dashboard — تشغيل التقييم على جميع المهارات أو مهارة محددة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSkills}
            disabled={loading}
          >
            <RefreshCw className={`ml-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Button
            size="sm"
            onClick={() => startTransition(() => runEvaluation())}
            disabled={evalRunning}
          >
            {evalRunning ? (
              <Loader2 className="ml-1 h-4 w-4 animate-spin" />
            ) : (
              <Play className="ml-1 h-4 w-4" />
            )}
            تقييم الكل
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-center">
                {summary.total}
              </CardTitle>
              <CardDescription className="text-center">إجمالي المهارات</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-center text-green-600">
                {summary.withDatasets}
              </CardTitle>
              <CardDescription className="text-center">بها بيانات تقييم</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-center text-blue-600">
                {summary.withCriteria}
              </CardTitle>
              <CardDescription className="text-center">بها معايير تقييم</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-center">
                {Object.keys(summary.byLevel).length}
              </CardTitle>
              <CardDescription className="text-center">مستويات</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <Card className="border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-center gap-2 pt-4 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Skills table */}
      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ScrollText className="h-5 w-5" />
              المهارات
            </CardTitle>
            <CardDescription>
              {skills.length} مهارة — {skills.filter((s) => s.hasDataset).length} منها جاهزة للتقييم
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المهارة</TableHead>
                  <TableHead className="text-right">المستوى</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">بيانات</TableHead>
                  <TableHead className="text-right">معايير</TableHead>
                  <TableHead className="text-right">الإجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skills.map((skill) => (
                  <TableRow key={skill.skillId}>
                    <TableCell className="font-medium">
                      {skill.skillName}
                      <div className="text-muted-foreground text-xs">{skill.version}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{levelLabel(skill.level)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {skill.category}
                    </TableCell>
                    <TableCell>
                      {skill.hasDataset ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        >
                          ✓
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          —
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {skill.criteriaCount > 0 ? (
                        <span>{skill.criteriaCount}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={evalRunning || !skill.hasDataset}
                        onClick={() => {
                          setEvalSkillId(skill.skillId);
                          runEvaluation(skill.skillId);
                        }}
                      >
                        {evalRunning && evalSkillId === skill.skillId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "تشغيل"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Evaluation error */}
      {evalError && (
        <Card className="border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-center gap-2 pt-4 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm">{evalError}</span>
          </CardContent>
        </Card>
      )}

      {/* Evaluation results */}
      {evalResults && !evalError && (
        <>
          {/* Single result */}
          {evalResults.type === "single" && (
            <SingleResultCard result={evalResults.result as EvaluationResult} />
          )}

          {/* Batch result */}
          {evalResults.type === "batch" && (
            <BatchResultCard
              result={evalResults.result as BatchEvalResult}
              onRerunSkill={(skillId) => runEvaluation(skillId)}
              evalRunning={evalRunning}
              currentSkillId={evalSkillId}
            />
          )}
        </>
      )}

      {/* Running indicator */}
      {evalRunning && !evalResults && (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">
              جاري التقييم...
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Sub-components ───

function SingleResultCard({ result }: { result: EvaluationResult }) {
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
        {/* Score */}
          <div className="flex items-center gap-4">
          <div className={`text-3xl font-bold ${scoreColor(result.overallScore, result.passThreshold)}`}>
            {pct(result.overallScore)}
          </div>
          <div className="text-muted-foreground text-sm">
            الحد الأدنى: {pct(result.passThreshold)} —{" "}
            {result.durationMs}ms
          </div>
        </div>

        {/* Criteria */}
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

        {/* Samples */}
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

        {/* Errors */}
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

function BatchResultCard({
  result,
  onRerunSkill,
  evalRunning,
  currentSkillId,
}: {
  result: BatchEvalResult;
  onRerunSkill: (skillId: string) => void;
  evalRunning: boolean;
  currentSkillId: string | null;
}) {
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
        {/* Overall pass rate */}
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

        {/* Results table */}
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

        {/* Batch errors */}
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
