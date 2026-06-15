export {
  OfficeAiAdvError,
  createWorkflowTemplate,
  getWorkflowTemplate,
  listWorkflowTemplates,
  instantiateWorkflow,
  createSchedule,
  getSchedule,
  listSchedules,
  processDueSchedules,
  createRoleConfig,
  getRoleConfig,
  listRoleConfigs,
  getTaskStats,
} from './office-ai-adv-service'

export type {
  WorkflowTemplateStep,
  OfficeAiWorkflowTemplate,
  CreateWorkflowTemplateData,
  OfficeAiSchedule,
  CreateScheduleData,
  OfficeAiRoleConfig,
  CreateRoleConfigData,
  OfficeAiTaskStats,
} from './office-ai-adv-service'

export { ADV_STRINGS } from './adv-strings'
