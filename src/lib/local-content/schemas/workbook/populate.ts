import { z } from "zod";
import { optionalText, requiredText } from "../common";

/**
 * Trial balance line schema (matches TbLine interface).
 *
 * accountCode and accountName are required strings.
 * debit and credit are required numbers (coerced from string/FormData).
 */
const tbLineSchema = z.object({
  id: z.string().optional(),
  accountCode: z.string().min(1, "Account code is required"),
  accountName: z.string().min(1, "Account name is required"),
  debit: z.coerce.number(),
  credit: z.coerce.number(),
  balance: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  period: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Schema for `populateWorkbookFromTbAction`.
 *
 * Accepts projectId (path param), an array of TbLine objects,
 * and an optional title string.
 */
export const populateWorkbookFromTbSchema = z.object({
  projectId: requiredText,
  tbLines: z.array(tbLineSchema).min(1, "At least one TB line required"),
  title: optionalText,
});
