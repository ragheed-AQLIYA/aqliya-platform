"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import type { SkillInfo, ApiSkillListResponse, ApiEvalResponse } from "./types";

export function useSkillsEvaluation() {
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [summary, setSummary] = useState<ApiSkillListResponse["summary"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [evalRunning, setEvalRunning] = useState(false);
  const [evalSkillId, setEvalSkillId] = useState<string | null>(null);
  const [evalResults, setEvalResults] = useState<ApiEvalResponse | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

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

  return {
    skills, summary, loading, error,
    evalRunning, evalSkillId, evalResults, evalError,
    fetchSkills, runEvaluation, startTransition,
  };
}
