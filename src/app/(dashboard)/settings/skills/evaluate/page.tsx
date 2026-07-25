"use client";

import { SkillsHeader } from "./components/skills-header";
import { SummaryCards } from "./components/summary-cards";
import { SkillsTable } from "./components/skills-table";
import { SingleResultCard } from "./components/single-result-card";
import { BatchResultCard } from "./components/batch-result-card";
import { ErrorBanner, LoadingSpinner, RunningIndicator } from "./components/status-display";
import { useSkillsEvaluation } from "./components/use-skills-evaluation";
import type { EvaluationResult, BatchEvalResult } from "./components/types";

export default function SkillsEvaluationPage() {
  const {
    skills, summary, loading, error,
    evalRunning, evalSkillId, evalResults, evalError,
    fetchSkills, runEvaluation, startTransition,
  } = useSkillsEvaluation();

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6" dir="rtl">
      <SkillsHeader
        fetchSkills={fetchSkills}
        runEvaluation={() => runEvaluation()}
        loading={loading}
        evalRunning={evalRunning}
        startTransition={startTransition}
      />

      {summary && <SummaryCards summary={summary} />}

      {error && <ErrorBanner message={error} />}

      {loading && <LoadingSpinner />}

      {!loading && !error && (
        <SkillsTable
          skills={skills}
          evalRunning={evalRunning}
          evalSkillId={evalSkillId}
          onRunSkill={(id) => runEvaluation(id)}
        />
      )}

      {evalError && <ErrorBanner message={evalError} />}

      {evalResults && !evalError && (
        <>
          {evalResults.type === "single" && (
            <SingleResultCard result={evalResults.result as EvaluationResult} />
          )}
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

      {evalRunning && !evalResults && <RunningIndicator />}
    </div>
  );
}
