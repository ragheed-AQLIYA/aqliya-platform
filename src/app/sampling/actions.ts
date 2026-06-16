"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import {
  createPlan as svcCreatePlan,
  executeSample as svcExecuteSample,
  getPlan as svcGetPlan,
  listPlans as svcListPlans,
  getResult as svcGetResult,
  getResultsByPlan as svcGetResultsByPlan,
  SamplingError,
} from "@/lib/platform/sampling";
import type { CreatePlanData } from "@/lib/platform/sampling";

export async function createPlanAction(data: CreatePlanData) {
  try {
    const user = await getCurrentUser();
    const plan = await svcCreatePlan(user.organizationId, data, user.id);

    await writePlatformAuditLog({
      productKey: "audit",
      action: "SAMPLING_PLAN_CREATED",
      targetType: "samplingPlan",
      targetId: plan.id,
      actorId: user.id,
      metadata: {
        method: data.method,
        populationSize: data.populationSize,
        sampleSize: plan.sampleSize,
        confidenceLevel: data.confidenceLevel,
        materialityPct: data.materialityPct,
      },
    });

    revalidatePath("/sampling");
    return { success: true as const, data: plan };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof SamplingError ? err.message : "Failed to create sampling plan",
    };
  }
}

export async function executeSampleAction(
  planId: string,
  population: unknown[],
  options?: { strataField?: string },
) {
  try {
    const user = await getCurrentUser();
    const result = await svcExecuteSample(planId, population, user.id, options);

    await writePlatformAuditLog({
      productKey: "audit",
      action: "SAMPLING_PLAN_EXECUTED",
      targetType: "samplingPlan",
      targetId: planId,
      actorId: user.id,
      metadata: {
        sampleSize: result.sampleSize,
        sampleErrors: result.sampleErrors,
        projectedError: result.projectedError,
      },
    });

    revalidatePath(`/sampling/${planId}`);
    return { success: true as const, data: result };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof SamplingError ? err.message : "Failed to execute sampling plan",
    };
  }
}

export async function getSamplingPlans() {
  try {
    const user = await getCurrentUser();
    const plans = await svcListPlans(user.organizationId);
    return { success: true as const, data: plans };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to fetch sampling plans",
    };
  }
}

export async function getSamplingPlan(planId: string) {
  try {
    const plan = await svcGetPlan(planId);
    if (!plan) {
      return { success: false as const, error: "Sampling plan not found" };
    }
    const user = await getCurrentUser();
    if (plan.organizationId !== user.organizationId) {
      return { success: false as const, error: "Access denied" };
    }
    const results = await svcGetResultsByPlan(planId);
    return { success: true as const, data: { plan, results } };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to fetch sampling plan",
    };
  }
}
