export {
  VALID_TASK_TYPES,
  VALID_STATUSES,
  VALID_LANGUAGES,
  validateRequired,
  validateIn,
} from "./common";
export type {
  OfficeAiTaskType,
  OfficeAiStatus,
  OfficeAiLanguage,
  CreateOfficeAiTaskInput,
  AddOfficeAiFileInput,
  AddOfficeAiOutputInput,
  OfficeAiTaskResult,
  OfficeAiTaskListResult,
  OfficeAiFileResult,
  OfficeAiOutputResult,
} from "./common";

export {
  createOfficeAiTask,
  getOfficeAiTaskById,
  listOfficeAiTasksByProject,
  listOfficeAiTasksByWorkspace,
} from "./task-crud";

export {
  updateOfficeAiTaskStatus,
  updateOfficeAiTaskDetails,
  archiveOfficeAiTask,
} from "./task-status";

export { addOfficeAiFile } from "./file-operations";

export {
  addOfficeAiOutput,
  updateOfficeAiOutputContent,
  updateOfficeAiOutputStatus,
} from "./output-operations";

export { generateOfficeAiTaskOutput } from "./generate-output";
