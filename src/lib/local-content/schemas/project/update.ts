import { z } from "zod";
import { projectStatus } from "../common";

/**
 * Schema for `updateLocalContentProjectAction`.
 *
 * Accepts a status string that must be a valid ProjectStatus.
 */
export const updateProjectSchema = z.object({
  status: projectStatus,
});
