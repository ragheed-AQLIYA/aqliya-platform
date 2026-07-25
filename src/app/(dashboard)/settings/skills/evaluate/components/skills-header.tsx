"use client";

import { Button } from "@/components/ui/button";
import { BarChart3, Play, RefreshCw, Loader2 } from "lucide-react";

interface SkillsHeaderProps {
  fetchSkills: () => void;
  runEvaluation: () => void;
  loading: boolean;
  evalRunning: boolean;
  startTransition: (fn: () => void) => void;
}

export function SkillsHeader({
  fetchSkills,
  runEvaluation,
  loading,
  evalRunning,
  startTransition,
}: SkillsHeaderProps) {
  return (
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
  );
}
