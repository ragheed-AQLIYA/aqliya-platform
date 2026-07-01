import { z } from "zod";
import { requiredText, optionalText } from "../common";

/**
 * Schema for `submitLocalContentReviewAction`.
 *
 * Accepts FormData with action (required) and comments (optional).
 */
export const submitReviewSchema = z.object({
  action: requiredText,
  comments: optionalText,
});

/**
 * Schema for `submitLocalContentApprovalAction`.
 *
 * Accepts FormData with decision (required) and comments (optional).
 */
export const submitApprovalSchema = z.object({
  decision: requiredText,
  comments: optionalText,
});
