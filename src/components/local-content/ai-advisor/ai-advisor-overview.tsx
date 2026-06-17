"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ─── Types ───

interface PendingFlag {
  id: string;
  workbookLineCode: string;
  accountCode: string;
  accountName: string;
  confidence: number;
  riskLevel: string;
  riskReason: string;
  status: string;
}

interface PendingSuggestion {
  id: string;
  workbookLineCode: string;
  currentPattern: string;
  suggestedPattern: string;
  reasoning: string;
  confidence: number;
  status: string;
}

interface IndustryBenchmark {
  industry: string;
  workbookLineCode: string;
  totalMatches: number;
  correctMatches: number;
  falsePositives: number;
  effectivenessPct: number;
}

interface OrgMemory {
  workbookLineCode: string;
  accountCode: string;
  accountName: string;
  previousResult: string;
  manualOverride: boolean;
  overrideReason: string | null;
}

interface AdvisorOverviewProps {
  pendingFlags: PendingFlag[];
  pendingSuggestions: PendingSuggestion[];
  industryBenchmarks: IndustryBenchmark[];
  orgMemory: OrgMemory[];
  onReviewFlag: (id: string, decision: "confirmed" | "rejected", notes: string) => Promise<unknown>;
  onReviewSuggestion: (id: string, decision: "approved" | "rejected", notes: string) => Promise<unknown>;
}

// ─── Empty State ───

function EmptySection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <svg
          className="h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}

// ─── False Positive Review Card ───

function FpReviewCard({
  flag,
  onReview,
}: {
  flag: PendingFlag;
  onReview: (id: string, decision: "confirmed" | "rejected") => void;
}) {
  const [notes, setNotes] = useState("");

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                {flag.accountCode}
              </code>
              <span className="text-muted-foreground font-normal text-sm">
                {flag.accountName}
              </span>
            </CardTitle>
            <CardDescription className="mt-1">
              <span className="font-medium">الخط / Line:</span>{" "}
              {flag.workbookLineCode}
            </CardDescription>
          </div>
          <Badge
            variant={
              flag.riskLevel === "high"
                ? "destructive"
                : flag.riskLevel === "medium"
                  ? "default"
                  : "secondary"
            }
          >
            {flag.riskLevel === "high"
              ? "عالية / High"
              : flag.riskLevel === "medium"
                ? "متوسطة / Medium"
                : "منخفضة / Low"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {flag.riskReason}
        </p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="ملاحظات المراجعة..."
            className="flex-1 rounded-md border px-3 py-1.5 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReview(flag.id, "confirmed")}
          >
            ✅ تأكيد FP
          </Button>
          <Button
            size="sm"
            onClick={() => onReview(flag.id, "rejected")}
          >
            ❌ رفض FP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Pattern Suggestion Card ───

function SuggestionCard({
  suggestion,
  onReview,
}: {
  suggestion: PendingSuggestion;
  onReview: (id: string, decision: "approved" | "rejected") => void;
}) {
  const [notes, setNotes] = useState("");

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                {suggestion.workbookLineCode}
              </code>
              {" — "}
              <span className="text-sm font-normal">
                تحسين النمط / Pattern Improvement
              </span>
            </CardTitle>
            <CardDescription className="mt-1">
              الثقة: {suggestion.confidence}%
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {suggestion.confidence >= 70
              ? "موصى به / Recommended"
              : "اقتراح / Suggestion"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            النمط الحالي / Current Pattern:
          </p>
          <pre className="rounded bg-muted p-2 text-xs overflow-x-auto whitespace-pre-wrap max-h-20 overflow-y-auto">
            {suggestion.currentPattern}
          </pre>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            النمط المقترح / Suggested Pattern:
          </p>
          <pre className="rounded bg-blue-50 dark:bg-blue-950 p-2 text-xs overflow-x-auto whitespace-pre-wrap max-h-20 overflow-y-auto">
            {suggestion.suggestedPattern}
          </pre>
        </div>
        <p className="text-sm text-muted-foreground">
          {suggestion.reasoning}
        </p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="ملاحظات المراجعة..."
            className="flex-1 rounded-md border px-3 py-1.5 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReview(suggestion.id, "rejected")}
          >
            ❌ رفض / Reject
          </Button>
          <Button
            size="sm"
            onClick={() => onReview(suggestion.id, "approved")}
          >
            ✅ اعتماد / Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Industry Benchmark Table ───

function IndustryBenchmarksTable({
  benchmarks,
}: {
  benchmarks: IndustryBenchmark[];
}) {
  if (benchmarks.length === 0) {
    return (
      <EmptySection
        title="لا توجد بيانات قطاعية"
        description="لم يتم جمع بيانات كافية عن فعالية الأنماط بعد. ستظهر هنا بعد استخدام ميزة Pattern Learning Assistant."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">القطاع / Industry</th>
            <th className="pb-2 font-medium">الرمز / Code</th>
            <th className="pb-2 font-medium text-right">إجمالي / Total</th>
            <th className="pb-2 font-medium text-right">صحيح / Correct</th>
            <th className="pb-2 font-medium text-right">FP</th>
            <th className="pb-2 font-medium text-right">الفعالية / Eff.</th>
          </tr>
        </thead>
        <tbody>
          {benchmarks.map((b, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-2 capitalize">{b.industry}</td>
              <td className="py-2">
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  {b.workbookLineCode}
                </code>
              </td>
              <td className="py-2 text-right">{b.totalMatches}</td>
              <td className="py-2 text-right">{b.correctMatches}</td>
              <td className="py-2 text-right">{b.falsePositives}</td>
              <td className="py-2 text-right">
                <span
                  className={
                    b.effectivenessPct >= 80
                      ? "text-green-600"
                      : b.effectivenessPct >= 50
                        ? "text-amber-600"
                        : "text-red-600"
                  }
                >
                  {b.effectivenessPct}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Organization Memory Table ───

function OrgMemoryTable({ memories }: { memories: OrgMemory[] }) {
  if (memories.length === 0) {
    return (
      <EmptySection
        title="لا توجد ذاكرة تنظيمية"
        description="لم يتم تسجيل أي قرارات تجاوز بعد. ستظهر هنا بعد مراجعة النتائج الخاطئة."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">الرمز / Code</th>
            <th className="pb-2 font-medium">الحساب / Account</th>
            <th className="pb-2 font-medium">النتيجة السابقة</th>
            <th className="pb-2 font-medium">تجاوز يدوي</th>
            <th className="pb-2 font-medium">السبب / Reason</th>
          </tr>
        </thead>
        <tbody>
          {memories.map((m, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-2">
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  {m.workbookLineCode}
                </code>
              </td>
              <td className="py-2">
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  {m.accountCode}
                </code>{" "}
                {m.accountName}
              </td>
              <td className="py-2">
                <Badge
                  variant={
                    m.previousResult === "matched"
                      ? "default"
                      : m.previousResult === "overridden"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {m.previousResult === "matched"
                    ? "مطابق"
                    : m.previousResult === "overridden"
                      ? "مستبعد"
                      : m.previousResult}
                </Badge>
              </td>
              <td className="py-2">
                {m.manualOverride ? (
                  <Badge variant="outline" className="text-xs">
                    نعم
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </td>
              <td className="py-2 text-muted-foreground text-xs max-w-[200px] truncate">
                {m.overrideReason ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ───

export function AiAdvisorOverview(props: AdvisorOverviewProps) {
  const [reviewing, setReviewing] = useState<string | null>(null);

  const handleReviewFlag = useCallback(
    async (id: string, decision: "confirmed" | "rejected") => {
      setReviewing(id);
      try {
        await props.onReviewFlag(id, decision, "");
      } finally {
        setReviewing(null);
      }
    },
    [props],
  );

  const handleReviewSuggestion = useCallback(
    async (id: string, decision: "approved" | "rejected") => {
      setReviewing(id);
      try {
        await props.onReviewSuggestion(id, decision, "");
      } finally {
        setReviewing(null);
      }
    },
    [props],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            AI Advisor / المستشار الذكي
          </h1>
          <p className="text-muted-foreground">
            LocalContentOS Workbook Intelligence — اقتراحات الأنماط، شرح المطابقات، ومراجعة النتائج الخاطئة
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-amber-600">
              {props.pendingFlags.length}
            </CardTitle>
            <CardDescription>بانتظار المراجعة / Pending FP Flags</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-blue-600">
              {props.pendingSuggestions.length}
            </CardTitle>
            <CardDescription>اقتراحات أنماط / Pattern Suggestions</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-green-600">
              {props.industryBenchmarks.length}
            </CardTitle>
            <CardDescription>أنماط قطاعية / Industry Patterns</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-purple-600">
              {props.orgMemory.length}
            </CardTitle>
            <CardDescription>قرارات سابقة / Org Memory</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="fp-review" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fp-review">
            P0 — FP Review
            {props.pendingFlags.length > 0 && (
              <Badge variant="destructive" className="mr-2">
                {props.pendingFlags.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            P0 — Patterns
            {props.pendingSuggestions.length > 0 && (
              <Badge variant="default" className="mr-2">
                {props.pendingSuggestions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="industry">P1 — Industry</TabsTrigger>
          <TabsTrigger value="memory">P1 — Org Memory</TabsTrigger>
        </TabsList>

        {/* Tab: FP Review */}
        <TabsContent value="fp-review" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              مراجعة النتائج الخاطئة / False Positive Review
            </h2>
            <p className="text-sm text-muted-foreground">
              رااجع المطابقات عالية الخطورة وقرر ما إذا كانت نتائج خاطئة
            </p>
          </div>
          {props.pendingFlags.length === 0 ? (
            <EmptySection
              title="لا توجد نتائج خاطئة بانتظار المراجعة"
              description="جميع المطابقات تمت مراجعتها. قم بتشغيل Explain Accounts على مصنف جديد لاكتشاف نتائج خاطئة محتملة."
            />
          ) : (
            <div className="space-y-4">
              {props.pendingFlags.map((flag) => (
                <FpReviewCard
                  key={flag.id}
                  flag={flag}
                  onReview={handleReviewFlag}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Pattern Suggestions */}
        <TabsContent value="suggestions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              تحسين الأنماط / Pattern Learning Assistant
            </h2>
            <p className="text-sm text-muted-foreground">
              اقتراحات ذكية لتحسين أنماط المطابقة بناءً على النتائج الخاطئة والحسابات غير المتطابقة
            </p>
          </div>
          {props.pendingSuggestions.length === 0 ? (
            <EmptySection
              title="لا توجد اقتراحات أنماط"
              description="قم بتشغيل Pattern Analysis على مصنف لإنشاء اقتراحات تحسين الأنماط."
            />
          ) : (
            <div className="space-y-4">
              {props.pendingSuggestions.map((s) => (
                <SuggestionCard
                  key={s.id}
                  suggestion={s}
                  onReview={handleReviewSuggestion}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Industry Benchmarks */}
        <TabsContent value="industry" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              معايير القطاعات / Industry Pattern Benchmarks
            </h2>
            <p className="text-sm text-muted-foreground">
              فعالية أنماط المطابقة عبر القطاعات المختلفة
            </p>
          </div>
          <IndustryBenchmarksTable benchmarks={props.industryBenchmarks} />
        </TabsContent>

        {/* Tab: Org Memory */}
        <TabsContent value="memory" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              ذاكرة التجاوزات / Organization Match Memory
            </h2>
            <p className="text-sm text-muted-foreground">
              سجل قرارات التجاوز اليدوية لضمان اتساق المطابقات
            </p>
          </div>
          <OrgMemoryTable memories={props.orgMemory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
