import { z } from "zod";
import { requiredText } from "../common";

/**
 * Schema for `generateLocalContentReportAction`.
 *
 * Accepts reportType and format as strings (path params, not FormData).
 * Both are required and trimmed.
 */
export const generateReportSchema = z.object({
  reportType: requiredText,
  format: requiredText,
});
