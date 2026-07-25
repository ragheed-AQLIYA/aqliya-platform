"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAiAdvisorOverview } from "./use-ai-advisor-overview";
import { SummaryCards } from "./components/summary-cards";
import { FpReviewCard } from "./components/fp-review-card";
import { SuggestionCard } from "./components/suggestion-card";
import { IndustryBenchmarksTable } from "./components/industry-benchmarks-table";
import { OrgMemoryTable } from "./components/org-memory-table";
import { EmptySection } from "./components/empty-section";
import type { AdvisorOverviewProps } from "./types";

export function AiAdvisorOverview(props: AdvisorOverviewProps) {
  const { handleReviewFlag, handleReviewSuggestion } = useAiAdvisorOverview(
    props.onReviewFlag,
    props.onReviewSuggestion,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Advisor / المستشار الذكي</h1>
          <p className="text-muted-foreground">
            LocalContentOS Workbook Intelligence — اقتراحات الأنماط، شرح المطابقات، ومراجعة النتائج
            الخاطئة
          </p>
        </div>
      </div>

      <SummaryCards
        pendingFlagsCount={props.pendingFlags.length}
        pendingSuggestionsCount={props.pendingSuggestions.length}
        industryBenchmarksCount={props.industryBenchmarks.length}
        orgMemoryCount={props.orgMemory.length}
      />

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

        <TabsContent value="fp-review" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">مراجعة النتائج الخاطئة / False Positive Review</h2>
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
                <FpReviewCard key={flag.id} flag={flag} onReview={handleReviewFlag} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">تحسين الأنماط / Pattern Learning Assistant</h2>
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
                <SuggestionCard key={s.id} suggestion={s} onReview={handleReviewSuggestion} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="industry" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">معايير القطاعات / Industry Pattern Benchmarks</h2>
            <p className="text-sm text-muted-foreground">فعالية أنماط المطابقة عبر القطاعات المختلفة</p>
          </div>
          <IndustryBenchmarksTable benchmarks={props.industryBenchmarks} />
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">ذاكرة التجاوزات / Organization Match Memory</h2>
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
