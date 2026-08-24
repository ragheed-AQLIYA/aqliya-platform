import { z } from "zod";
import {
  requiredText,
  optionalText,
  currencyAmount,
  percentage,
  classificationBasis,
  optionalConfidenceLevel,
  csvText,
} from "../common";

/**
 * Schema for `createLocalContentSpendRecordAction`.
 *
 * Accepts FormData. amount is coerced to number and validated as currency.
 */
export const createSpendRecordSchema = z.object({
  supplierId: requiredText,
  amount: currencyAmount,
  category: requiredText,
  currency: optionalText,
  contractReference: optionalText,
  period: requiredText,
  description: optionalText,
  /**
   * Official LCGPA/Etimad product code (digits only, leading zeros allowed).
   * Optional — unmapped lines remain UNKNOWN under strict regulatory binding.
   */
  lcgpaProductCode: z
    .string()
    .trim()
    .regex(/^\d{1,12}$/, "كود المنتج يجب أن يكون أرقاماً فقط (حتى 12 رقماً)")
    .optional()
    .or(z.literal("")),
});

/**
 * Schema for `classifyLocalContentSpendRecordAction`.
 *
 * Accepts FormData with localPercentage (0-100), classificationBasis, etc.
 */
export const classifySpendRecordSchema = z.object({
  supplierId: optionalText,
  spendRecordId: optionalText,
  localPercentage: percentage,
  classificationBasis,
  confidence: optionalConfidenceLevel,
  notes: optionalText,
});

/**
 * Schema for `importLocalContentSpendCsvAction`.
 *
 * Accepts a raw CSV text string.
 */
export const importSpendCsvSchema = z.object({
  csvText,
});
