"use client";

import { useState, useEffect, useCallback } from "react";
import {
  calculateMaterialityAction,
  approveMaterialityAction,
  getCurrentMaterialityAction,
  getMaterialityHistoryAction,
  getMethodologiesAction,
  suggestBenchmarkValueAction,
  generateMaterialityWorkingPaperAction,
} from "@/actions/audit-materiality-engine-actions";
import type { BenchmarkType } from "@/lib/audit/materiality-engine";

export interface MethodologyInfo {
  benchmarkType: string;
  percentageDefault: number;
  percentageMin: number;
  percentageMax: number;
  label: string;
  description: string;
  regulatoryReference: string;
}

export interface MaterialitySet {
  planningId: string;
  performanceId: string;
  trivialId: string;
  benchmarkValue: number;
  planningMateriality: number;
  performanceMateriality: number;
  trivialThreshold: number;
  currency: string;
  percentage: number;
  performancePercentage: number;
  trivialPercentage: number;
  status: string;
}

export function useMateriality(engagementId: string) {
  const [activeTab, setActiveTab] = useState("calculate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [methodologies, setMethodologies] = useState<MethodologyInfo[]>([]);
  const [selectedMethodology, setSelectedMethodology] = useState("revenue");
  const [percentage, setPercentage] = useState("0.5");
  const [benchmarkValue, setBenchmarkValue] = useState("");
  const [currency, setCurrency] = useState("SAR");
  const [rationale, setRationale] = useState("");

  const [current, setCurrent] = useState<MaterialitySet | null>(null);
  const [history, setHistory] = useState<MaterialitySet[]>([]);
  const [workingPaper, setWorkingPaper] = useState<string | null>(null);

  const loadMethodologies = useCallback(async () => {
    try {
      const methods = await getMethodologiesAction();
      setMethodologies(methods);
    } catch { /* ignore */ }
  }, []);

  const loadCurrent = useCallback(async () => {
    try {
      const c = await getCurrentMaterialityAction(engagementId);
      if (c) {
        setCurrent({
          planningId: c.id,
          performanceId: c.performanceMateriality?.id ?? "",
          trivialId: c.trivialThreshold?.id ?? "",
          benchmarkValue: c.benchmark?.value ?? 0,
          planningMateriality: c.computedAmount,
          performanceMateriality: c.performanceMateriality?.computedAmount ?? 0,
          trivialThreshold: c.trivialThreshold?.computedAmount ?? 0,
          currency: c.currency,
          percentage: c.percentage,
          performancePercentage: c.performanceMateriality?.percentage ?? 0.75,
          trivialPercentage: c.trivialThreshold?.percentage ?? 0.05,
          status: c.status,
        });
      }
    } catch { /* ignore */ }
  }, [engagementId]);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const h = await getMaterialityHistoryAction(engagementId);
      setHistory(
        h.map((c: Record<string, unknown>) => ({
          planningId: c.id as string,
          performanceId: (c.performanceMateriality as { id?: string })?.id ?? "",
          trivialId: (c.trivialThreshold as { id?: string })?.id ?? "",
          benchmarkValue: (c.benchmark as { value?: number })?.value ?? 0,
          planningMateriality: c.computedAmount as number,
          performanceMateriality: (c.performanceMateriality as { computedAmount?: number })?.computedAmount ?? 0,
          trivialThreshold: (c.trivialThreshold as { computedAmount?: number })?.computedAmount ?? 0,
          currency: c.currency as string,
          percentage: c.percentage as number,
          performancePercentage: (c.performanceMateriality as { percentage?: number })?.percentage ?? 0.75,
          trivialPercentage: (c.trivialThreshold as { percentage?: number })?.percentage ?? 0.05,
          status: c.status as string,
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تحميل السجل");
    } finally {
      setLoading(false);
    }
  }, [engagementId]);

  const handleMethodologyChange = useCallback(async (value: string) => {
    setSelectedMethodology(value);
    const method = methodologies.find((m) => m.benchmarkType === value);
    if (method) {
      setPercentage((method.percentageDefault * 100).toString());
    }
    try {
      const suggested = await suggestBenchmarkValueAction(engagementId, value as BenchmarkType);
      if (suggested !== null) {
        setBenchmarkValue(suggested.toString());
      }
    } catch { /* ignore */ }
  }, [methodologies, engagementId]);

  const handleCalculate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const method = methodologies.find((m) => m.benchmarkType === selectedMethodology);
      const result = await calculateMaterialityAction({
        engagementId,
        benchmarkType: selectedMethodology as BenchmarkType,
        sourceType: "trial_balance",
        benchmarkValue: Number(benchmarkValue),
        currency,
        percentage: Number(percentage) / 100,
        methodologyRef: method?.regulatoryReference,
        rationale: rationale || undefined,
      });
      setCurrent(result);
      setSuccess("تم حساب الأهمية النسبية بنجاح");
      setActiveTab("current");
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل حساب الأهمية النسبية");
    } finally {
      setLoading(false);
    }
  }, [engagementId, methodologies, selectedMethodology, benchmarkValue, currency, percentage, rationale]);

  const handleApprove = useCallback(async () => {
    if (!current) return;
    setLoading(true);
    setError(null);
    try {
      await approveMaterialityAction(current.planningId, engagementId);
      setSuccess("تم اعتماد الأهمية النسبية");
      await loadCurrent();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل اعتماد الأهمية النسبية");
    } finally {
      setLoading(false);
    }
  }, [current, engagementId, loadCurrent]);

  const handleGenerateWorkingPaper = useCallback(async () => {
    setLoading(true);
    try {
      const paper = await generateMaterialityWorkingPaperAction(engagementId);
      setWorkingPaper(paper);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إنشاء ورقة العمل");
    } finally {
      setLoading(false);
    }
  }, [engagementId]);

  const formatAmount = useCallback((value: number, cur: string = currency): string => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `${cur} ${(abs / 1_000_000_000).toFixed(2)}B`;
    if (abs >= 1_000_000) return `${cur} ${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${cur} ${(abs / 1_000).toFixed(2)}K`;
    return `${cur} ${abs.toFixed(2)}`;
  }, [currency]);

  useEffect(() => {
    loadMethodologies();
    loadCurrent();
  }, [loadMethodologies, loadCurrent]);

  return {
    activeTab,
    setActiveTab,
    loading,
    error,
    success,
    methodologies,
    selectedMethodology,
    percentage,
    benchmarkValue,
    currency,
    rationale,
    current,
    history,
    workingPaper,
    setPercentage,
    setBenchmarkValue,
    setCurrency,
    setRationale,
    handleMethodologyChange,
    handleCalculate,
    handleApprove,
    handleGenerateWorkingPaper,
    loadHistory,
    formatAmount,
  };
}
