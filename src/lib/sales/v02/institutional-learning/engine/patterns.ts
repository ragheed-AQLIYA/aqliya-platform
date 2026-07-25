// SalesOS v0.2 Institutional Learning — pattern derivation

import { getWinLossPatterns } from "../../../vnext/commercial-memory";
import type {
  InstitutionalLearningInput,
  InstitutionalLearningPattern,
} from "../types";
import {
  PATTERN_MIN_COUNT,
  bucketReasons,
  evidence,
  patternConfidence,
  reasonLabelAr,
} from "./common";

export function deriveWinLossPatterns(
  input: InstitutionalLearningInput,
): InstitutionalLearningPattern[] {
  const patterns: InstitutionalLearningPattern[] = [];

  for (const [reason, ev] of bucketReasons(
    input.wonDeals ?? [],
    "won",
  )) {
    if (ev.length < PATTERN_MIN_COUNT) continue;
    patterns.push({
      id: `pattern-win-${reason}`,
      patternType: "win_theme",
      label: `Win theme: ${reason}`,
      labelAr: `نمط فوز: ${reasonLabelAr(reason)}`,
      count: ev.length,
      confidence: patternConfidence(ev.length, ev.length),
      recommendation: `Replicate proof and qualification steps tied to "${reason}" — draft only.`,
      recommendationAr: `كرّر أدلة التأهيل المرتبطة بـ "${reasonLabelAr(reason)}" — مسودة فقط.`,
      evidence: ev,
      outputStatus: "recommendation",
    });
  }

  for (const [reason, ev] of bucketReasons(
    input.lostDeals ?? [],
    "lost",
  )) {
    if (ev.length < PATTERN_MIN_COUNT) continue;
    patterns.push({
      id: `pattern-loss-${reason}`,
      patternType: "loss_theme",
      label: `Loss theme: ${reason}`,
      labelAr: `نمط خسارة: ${reasonLabelAr(reason)}`,
      count: ev.length,
      confidence: patternConfidence(ev.length, ev.length),
      recommendation: `Review qualification gates for "${reason}" before advancing stage — draft only.`,
      recommendationAr: `راجع بوابات التأهيل لـ "${reasonLabelAr(reason)}" قبل تقدم المرحلة — مسودة فقط.`,
      evidence: ev,
      outputStatus: "recommendation",
    });
  }

  const signalBuckets = new Map<string, InstitutionalLearningPattern["evidence"]>();
  for (const sig of input.signals) {
    if (sig.strength !== "strong" && sig.strength !== "moderate") continue;
    const key = sig.signalType;
    const list = signalBuckets.get(key) ?? [];
    list.push(
      evidence({
        source: "signal",
        refId: sig.id,
        summary: `${sig.signalType}: ${sig.description}`,
        summaryAr: `إشارة ${sig.signalType}: ${sig.description}`,
      }),
    );
    signalBuckets.set(key, list);
  }
  for (const [signalType, ev] of signalBuckets) {
    if (ev.length < PATTERN_MIN_COUNT) continue;
    patterns.push({
      id: `pattern-signal-${signalType}`,
      patternType: "signal_cluster",
      label: `Repeated ${signalType} signals`,
      labelAr: `تكرار إشارات ${signalType}`,
      count: ev.length,
      confidence: patternConfidence(ev.length, ev.length),
      recommendation: `Prioritize follow-up while ${signalType} signals are active — draft only.`,
      recommendationAr: `أولِ المتابعة عند نشاط إشارات ${signalType} — مسودة فقط.`,
      evidence: ev,
      outputStatus: "recommendation",
    });
  }

  const wonOppIds = new Set(
    (input.wonDeals ?? []).map((d) => d.opportunityId),
  );
  const proofHits = new Map<string, InstitutionalLearningPattern["evidence"]>();
  for (const asset of input.proofAssets) {
    const linked = (asset.linkedOpportunityIds ?? []).filter((id) =>
      wonOppIds.has(id),
    );
    if (linked.length === 0) continue;
    const list = proofHits.get(asset.id) ?? [];
    for (const oppId of linked) {
      list.push(
        evidence({
          source: "proof_asset",
          refId: asset.id,
          summary: `Proof "${asset.title}" linked to won opportunity ${oppId}`,
          summaryAr: `دليل "${asset.title}" مرتبط بفرصة فائزة ${oppId}`,
        }),
      );
    }
    proofHits.set(asset.id, list);
  }
  for (const [assetId, ev] of proofHits) {
    if (ev.length < 1) continue;
    const asset = input.proofAssets.find((a) => a.id === assetId);
    patterns.push({
      id: `pattern-proof-${assetId}`,
      patternType: "proof_correlation",
      label: `Proof correlated with wins: ${asset?.title ?? assetId}`,
      labelAr: `دليل مرتبط بالفوز: ${asset?.title ?? assetId}`,
      count: ev.length,
      confidence: patternConfidence(ev.length, ev.length),
      recommendation:
        "Reuse this proof asset in similar-stage deals — draft only.",
      recommendationAr:
        "أعد استخدام هذا الدليل في صفقات بمرحلة مماثلة — مسودة فقط.",
      evidence: ev,
      outputStatus: "recommendation",
    });
  }

  const activityKeywords: ReadonlyArray<{
    keys: string[];
    label: string;
  }> = [
    { keys: ["meeting", "workshop", "discovery"], label: "discovery_engagement" },
    { keys: ["pilot", "poC", "poc"], label: "pilot_motion" },
    { keys: ["proposal", "rfp"], label: "proposal_motion" },
  ];
  const activityBuckets = new Map<string, InstitutionalLearningPattern["evidence"]>();
  for (const act of input.activities) {
    const lower = act.summary.toLowerCase();
    for (const rule of activityKeywords) {
      if (!rule.keys.some((k) => lower.includes(k))) continue;
      const list = activityBuckets.get(rule.label) ?? [];
      list.push(
        evidence({
          source: "activity",
          refId: act.id,
          summary: `${act.type}: ${act.summary.slice(0, 120)}`,
          summaryAr: `${act.type}: ${act.summary.slice(0, 120)}`,
        }),
      );
      activityBuckets.set(rule.label, list);
    }
  }
  for (const [label, ev] of activityBuckets) {
    if (ev.length < PATTERN_MIN_COUNT) continue;
    patterns.push({
      id: `pattern-activity-${label}`,
      patternType: "activity_theme",
      label: `Activity theme: ${label}`,
      labelAr: `نمط نشاط: ${label}`,
      count: ev.length,
      confidence: patternConfidence(ev.length, ev.length),
      recommendation: `Sustain ${label.replace(/_/g, " ")} cadence on active pipeline — draft only.`,
      recommendationAr: `حافظ على إيقاع ${label} في خط الأنابيب النشط — مسودة فقط.`,
      evidence: ev,
      outputStatus: "recommendation",
    });
  }

  if (input.winLossInsights?.length) {
    const wlFromMemory = getWinLossPatterns({
      winLoss: input.winLossInsights,
      opportunities: [],
      interactions: [],
    });
    for (const wl of wlFromMemory.filter(
      (p) => p.count >= PATTERN_MIN_COUNT,
    )) {
      const existing = patterns.some(
        (p) => p.id === `pattern-wl-${wl.reason}`,
      );
      if (existing) continue;
      patterns.push({
        id: `pattern-wl-${wl.reason}`,
        patternType: wl.outcome === "won" ? "win_theme" : "loss_theme",
        label: `${wl.outcome} pattern: ${wl.reason}`,
        labelAr: `${wl.outcome === "won" ? "فوز" : "خسارة"}: ${reasonLabelAr(wl.reason)}`,
        count: wl.count,
        confidence: patternConfidence(wl.count, wl.count),
        recommendation:
          wl.outcome === "won"
            ? "Document win factors for institutional playbook — draft only."
            : "Add qualification checklist for this loss factor — draft only.",
        recommendationAr:
          wl.outcome === "won"
            ? "وثّق عوامل الفوز لدليل مؤسسي — مسودة فقط."
            : "أضف قائمة تأهيل لعامل الخسارة — مسودة فقط.",
        evidence: [
          evidence({
            source: "win_loss_insight",
            refId: wl.reason,
            summary: `${wl.outcome} ×${wl.count} — ${wl.reason}`,
            summaryAr: `${wl.outcome === "won" ? "فوز" : "خسارة"} ×${wl.count} — ${reasonLabelAr(wl.reason)}`,
          }),
        ],
        outputStatus: "recommendation",
      });
    }
  }

  return patterns.sort((a, b) => b.count - a.count);
}
