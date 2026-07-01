import { z } from "zod";
import { requiredText, optionalText } from "../common";

/**
 * Schema for `createWorkbookAction`.
 * Validates projectId and title before workbook creation.
 */
export const createWorkbookSchema = z.object({
  projectId: requiredText,
  title: requiredText.max(255, "Title too long (max 255)"),
});

/**
 * Schema for `populateWorkbookAction`.
 * Validates projectId with optional title.
 */
export const populateWorkbookSchema = z.object({
  projectId: requiredText,
  title: optionalText,
});

export { populateWorkbookFromTbSchema } from "./populate";
