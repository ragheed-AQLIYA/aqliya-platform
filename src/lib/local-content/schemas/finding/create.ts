import { z } from "zod";
import { requiredText, optionalText, findingType, optionalFindingSeverity } from "../common";

/**
 * Schema for `createLocalContentFindingAction`.
 *
 * Accepts FormData. type, title, and description are required.
 * severity, linkedSupplierId, and linkedSpendRecordId are optional.
 */
export const createFindingSchema = z.object({
  type: findingType,
  title: requiredText,
  description: requiredText,
  severity: optionalFindingSeverity,
  linkedSupplierId: optionalText,
  linkedSpendRecordId: optionalText,
});

/**
 * Schema for `updateLocalContentFindingAction`.
 *
 * Same shape as create but all fields are optional (partial update).
 */
export const updateFindingSchema = createFindingSchema.partial();
