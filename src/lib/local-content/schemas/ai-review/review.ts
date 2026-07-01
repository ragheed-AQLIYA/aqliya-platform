import { z } from "zod";
import { requiredText } from "../common";

/**
 * Schema for `reviewRecommendationAction`.
 *
 * decision must be one of the allowed values (accepted, rejected, implemented).
 */
export const reviewRecommendationSchema = z.object({
  decision: z.enum(["accepted", "rejected", "implemented"]),
  reviewNotes: requiredText,
});

/**
 * Scenario type for simulation.
 */
const scenarioTypeEnum = z.enum(["supplier", "workforce", "asset", "mixed"]);

/**
 * Schema for `runSimulationAction`.
 *
 * Accepts organizationId, workbookId, scenarioType, and optional params.
 */
export const runSimulationSchema = z.object({
  organizationId: requiredText,
  workbookId: requiredText,
  scenarioType: scenarioTypeEnum,
  params: z.record(z.string(), z.coerce.number()).default({}),
});
