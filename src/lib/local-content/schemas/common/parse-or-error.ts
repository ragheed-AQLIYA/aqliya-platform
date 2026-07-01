import type { z } from "zod";

/** Standard validation error detail item */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

/** Standard success response */
export interface ParseSuccess<T> {
  success: true;
  data: T;
}

/** Standard validation error response */
export interface ParseError {
  success: false;
  code: "VALIDATION_ERROR";
  message: string;
  details: ValidationErrorDetail[];
}

/** Union type returned by parseOrError */
export type ParseResult<T> = ParseSuccess<T> | ParseError;

/**
 * Parse an unknown input against a Zod schema and return a standardised result.
 *
 * This is the ONLY approved way to handle Zod validation in LocalContentOS.
 * Every mutation entry point must use this function.
 *
 * ## Usage
 *
 * ```ts
 * const parsed = parseOrError(createSupplierSchema, Object.fromEntries(formData));
 * if (!parsed.success) return parsed;
 * // parsed.data is now typed and validated
 * ```
 */
export function parseOrError<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
): ParseResult<T> {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const details: ValidationErrorDetail[] = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));

  return {
    success: false,
    code: "VALIDATION_ERROR",
    message: "Invalid input",
    details,
  };
}
