import { z } from "zod";
import { requiredText, optionalText } from "../common";

/**
 * Schema for `createLocalContentProjectAction`.
 *
 * Accepts a FormData object and validates name + reportingPeriod as required.
 * scopeDescription is optional.
 */
export const createProjectSchema = z.object({
  name: requiredText,
  reportingPeriod: requiredText,
  scopeDescription: optionalText,
});

/**
 * Schema for `updateLocalContentVerificationItemAction`.
 *
 * Accepts FormData with scale (required) and optional workingPaperRef.
 */
export const updateVerificationItemSchema = z.object({
  scale: requiredText,
  workingPaperRef: optionalText,
});
