"use server";

import { revalidatePath } from "next/cache";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import {
  listDealHealth,
  createForecast as siCreateForecast,
  getForecast as siGetForecast,
  listForecasts as siListForecasts,
  calculateForecast as siCalculateForecast,
  getPipelineAnalytics,
  getWinRateAnalysis,
  getVelocityMetrics,
} from "@/lib/platform/sales-intelligence";
import type {
  CreateForecastInput,
  ForecastPeriod,
} from "@/lib/platform/sales-intelligence";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied", code: "FORBIDDEN" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[SalesIntel]", message);
    return { ok: false, error: message };
  }
}

function revalidateIntel() {
  revalidatePath("/sales/intelligence");
  revalidatePath("/sales/intelligence/forecasts");
}

// ─── Pipeline Dashboard ───

export async function getPipelineAnalyticsAction(pipelineId?: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    const result = await getPipelineAnalytics(
      user.organizationId,
      pipelineId,
    );
    return result;
  });
}

export async function getDealHealthListAction(pipelineId?: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    return listDealHealth(user.organizationId, pipelineId);
  });
}

export async function getWinRateAction() {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    return getWinRateAnalysis(user.organizationId);
  });
}

export async function getVelocityAction(pipelineId?: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    return getVelocityMetrics(user.organizationId, pipelineId);
  });
}

// ─── Forecasts ───

export async function createForecastAction(data: {
  name: string;
  period: ForecastPeriod;
  periodStart: string;
  periodEnd: string;
  expectedRevenue: number;
  confidencePct?: number;
  notes?: string;
}) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const input: CreateForecastInput = {
      name: data.name,
      period: data.period,
      periodStart: new Date(data.periodStart),
      periodEnd: new Date(data.periodEnd),
      expectedRevenue: data.expectedRevenue,
      confidencePct: data.confidencePct,
      notes: data.notes,
      createdById: user.id,
    };
    const forecast = await siCreateForecast(user.organizationId, input);
    await writePlatformAuditLog({
      productKey: "salesos",
      sourceSystem: "sales_intelligence",
      action: "forecast_created",
      platformOrganizationId: user.organizationId,
      actorId: user.id,
      targetType: "forecast",
      targetId: forecast.id,
      targetLabel: forecast.name,
    });
    revalidateIntel();
    return forecast;
  });
}

export async function listForecastsAction(period?: ForecastPeriod) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    return siListForecasts(user.organizationId, period);
  });
}

export async function getForecastAction(forecastId: string) {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    return siGetForecast(forecastId);
  });
}

export async function calculateForecastAction(forecastId: string) {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const result = await siCalculateForecast(forecastId);
    await writePlatformAuditLog({
      productKey: "salesos",
      sourceSystem: "sales_intelligence",
      action: "forecast_calculated",
      platformOrganizationId: user.organizationId,
      actorId: user.id,
      targetType: "forecast",
      targetId: forecastId,
      targetLabel: result.name,
    });
    revalidateIntel();
    return result;
  });
}
