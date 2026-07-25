export { OfficeAiAdvError } from './common'
export type {
  WorkflowTemplateStep,
  OfficeAiWorkflowTemplate,
  CreateWorkflowTemplateData,
  OfficeAiSchedule,
  CreateScheduleData,
  OfficeAiRoleConfig,
  CreateRoleConfigData,
  OfficeAiTaskStats,
} from './common'

export { createWorkflowTemplate, getWorkflowTemplate, listWorkflowTemplates, instantiateWorkflow } from './templates'
export { createSchedule, getSchedule, listSchedules, processDueSchedules } from './schedules'
export { createRoleConfig, getRoleConfig, listRoleConfigs } from './role-config'
export { getTaskStats } from './stats'
