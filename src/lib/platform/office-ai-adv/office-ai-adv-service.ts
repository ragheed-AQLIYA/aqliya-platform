import 'server-only'

import { prisma } from '@/lib/prisma'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { ADV_STRINGS } from './adv-strings'

const p = prisma as any

// ─── Error ───

export class OfficeAiAdvError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OfficeAiAdvError'
  }
}

// ─── Types ───

export interface WorkflowTemplateStep {
  stepOrder: number
  title: string
  description: string
  taskType: string
  defaultPriority: string
  assignedRoleSlug: string
  estimatedHours: number
}

export interface OfficeAiWorkflowTemplate {
  id: string
  organizationId: string
  name: string
  description: string | null
  steps: WorkflowTemplateStep[]
  isActive: boolean
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateWorkflowTemplateData {
  name: string
  description?: string
  steps: WorkflowTemplateStep[]
  isActive?: boolean
}

export interface OfficeAiSchedule {
  id: string
  organizationId: string
  name: string
  templateId: string | null
  taskConfig: Record<string, unknown>
  recurrence: string
  cronExpression: string | null
  nextRunAt: Date
  lastRunAt: Date | null
  isActive: boolean
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateScheduleData {
  name: string
  templateId?: string
  taskConfig: Record<string, unknown>
  recurrence: string
  cronExpression?: string
  nextRunAt: Date
  isActive?: boolean
}

export interface OfficeAiRoleConfig {
  id: string
  organizationId: string
  roleSlug: string
  maxTasksPerDay: number
  allowedTaskTypes: string[]
  requireApproval: boolean
  autoAssignThreshold: number
  responseStyle: string
  confidenceThreshold: number
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateRoleConfigData {
  roleSlug: string
  maxTasksPerDay?: number
  allowedTaskTypes?: string[]
  requireApproval?: boolean
  autoAssignThreshold?: number
  responseStyle?: string
  confidenceThreshold?: number
}

export interface OfficeAiTaskStats {
  total: number
  completed: number
  overdue: number
  completionRate: number
  overdueRate: number
  byType: Record<string, number>
  period: { start: Date; end: Date }
}

// ─── Helpers ───

const VALID_RECURRENCE = ['DAILY', 'WEEKLY', 'MONTHLY']

function validateOrgId(orgId: string): void {
  if (!orgId) throw new OfficeAiAdvError(ADV_STRINGS.error.ORG_ID_REQUIRED)
}

function validateUserId(userId: string): void {
  if (!userId) throw new OfficeAiAdvError(ADV_STRINGS.error.USER_ID_REQUIRED)
}

function replaceVariables(template: string, context: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    if (context[key] === undefined) {
      throw new OfficeAiAdvError(`${ADV_STRINGS.error.CONTEXT_VARIABLE_MISSING}: ${key}`)
    }
    return context[key]
  })
}

function computeNextRun(current: Date, recurrence: string): Date {
  const next = new Date(current)
  switch (recurrence) {
    case 'DAILY':
      next.setDate(next.getDate() + 1)
      break
    case 'WEEKLY':
      next.setDate(next.getDate() + 7)
      break
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1)
      break
  }
  return next
}

function mapTemplate(record: any): OfficeAiWorkflowTemplate {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    description: record.description,
    steps: record.steps as WorkflowTemplateStep[],
    isActive: record.isActive,
    createdById: record.createdById,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function mapSchedule(record: any): OfficeAiSchedule {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    templateId: record.templateId,
    taskConfig: record.taskConfig as Record<string, unknown>,
    recurrence: record.recurrence,
    cronExpression: record.cronExpression,
    nextRunAt: record.nextRunAt,
    lastRunAt: record.lastRunAt,
    isActive: record.isActive,
    createdById: record.createdById,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function mapRoleConfig(record: any): OfficeAiRoleConfig {
  return {
    id: record.id,
    organizationId: record.organizationId,
    roleSlug: record.roleSlug,
    maxTasksPerDay: record.maxTasksPerDay,
    allowedTaskTypes: record.allowedTaskTypes,
    requireApproval: record.requireApproval,
    autoAssignThreshold: record.autoAssignThreshold,
    responseStyle: record.responseStyle,
    confidenceThreshold: record.confidenceThreshold,
    createdById: record.createdById,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

// ─── Workflow Templates ───

export async function createWorkflowTemplate(
  orgId: string,
  data: CreateWorkflowTemplateData,
  userId: string,
): Promise<OfficeAiWorkflowTemplate> {
  validateOrgId(orgId)
  validateUserId(userId)
  if (!data.name) throw new OfficeAiAdvError(ADV_STRINGS.error.TEMPLATE_NAME_REQUIRED)
  if (!data.steps || data.steps.length === 0) {
    throw new OfficeAiAdvError(ADV_STRINGS.error.TEMPLATE_STEPS_EMPTY)
  }

  for (const step of data.steps) {
    if (typeof step.stepOrder !== 'number' || step.stepOrder < 0) {
      throw new OfficeAiAdvError(ADV_STRINGS.error.STEP_ORDER_INVALID)
    }
    if (!step.title) throw new OfficeAiAdvError(ADV_STRINGS.error.STEP_TITLE_REQUIRED)
    if (!step.taskType) throw new OfficeAiAdvError(ADV_STRINGS.error.STEP_TASK_TYPE_REQUIRED)
  }

  const record = await p.officeAiWorkflowTemplate.create({
    data: {
      organizationId: orgId,
      name: data.name,
      description: data.description ?? null,
      steps: data.steps,
      isActive: data.isActive ?? true,
      createdById: userId,
    },
  }).catch(() => { throw new OfficeAiAdvError(ADV_STRINGS.error.CREATE_TEMPLATE_FAILED) })

  await writePlatformAuditLog({
    productKey: 'office_ai_assistant',
    action: 'WORKFLOW_TEMPLATE_CREATED',
    targetType: 'officeAiWorkflowTemplate',
    targetId: record.id,
    actorId: userId,
    metadata: { name: data.name, stepCount: data.steps.length },
  })

  return mapTemplate(record)
}

export async function getWorkflowTemplate(
  templateId: string,
): Promise<OfficeAiWorkflowTemplate | null> {
  if (!templateId) return null
  const record = await p.officeAiWorkflowTemplate.findUnique({
    where: { id: templateId },
  }).catch(() => null)
  return record ? mapTemplate(record) : null
}

export async function listWorkflowTemplates(orgId: string): Promise<OfficeAiWorkflowTemplate[]> {
  validateOrgId(orgId)
  const records = await p.officeAiWorkflowTemplate.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  }).catch(() => { throw new OfficeAiAdvError(ADV_STRINGS.error.FETCH_FAILED) })
  return records.map(mapTemplate)
}

export async function instantiateWorkflow(
  templateId: string,
  userId: string,
  context: Record<string, string>,
): Promise<any[]> {
  validateUserId(userId)
  const template = await getWorkflowTemplate(templateId)
  if (!template) throw new OfficeAiAdvError(ADV_STRINGS.error.TEMPLATE_NOT_FOUND)
  if (!template.isActive) throw new OfficeAiAdvError(ADV_STRINGS.error.TEMPLATE_INACTIVE)

  const createdTasks: any[] = []
  for (const step of template.steps) {
    const title = replaceVariables(step.title, context)
    const description = replaceVariables(step.description, context)

    const task = await prisma.officeAiTask.create({
      data: {
        platformOrganizationId: template.organizationId,
        taskType: step.taskType,
        title,
        instructions: description,
        status: 'draft',
        createdById: userId,
        language: 'ar',
        metadata: {
          workflowTemplateId: templateId,
          stepOrder: step.stepOrder,
          assignedRoleSlug: step.assignedRoleSlug,
          estimatedHours: step.estimatedHours,
          priority: step.defaultPriority,
        },
      },
    })
    createdTasks.push(task)
  }

  await writePlatformAuditLog({
    productKey: 'office_ai_assistant',
    action: 'WORKFLOW_INSTANTIATED',
    targetType: 'officeAiWorkflowTemplate',
    targetId: templateId,
    actorId: userId,
    metadata: { stepsCreated: createdTasks.length, contextKeys: Object.keys(context) },
  })

  return createdTasks
}

// ─── Scheduling ───

export async function createSchedule(
  orgId: string,
  data: CreateScheduleData,
  userId: string,
): Promise<OfficeAiSchedule> {
  validateOrgId(orgId)
  validateUserId(userId)
  if (!data.name) throw new OfficeAiAdvError(ADV_STRINGS.error.SCHEDULE_NAME_REQUIRED)
  if (!VALID_RECURRENCE.includes(data.recurrence)) {
    throw new OfficeAiAdvError(ADV_STRINGS.error.INVALID_RECURRENCE)
  }
  if (!data.nextRunAt) {
    throw new OfficeAiAdvError('nextRunAt is required')
  }

  const record = await p.officeAiSchedule.create({
    data: {
      organizationId: orgId,
      name: data.name,
      templateId: data.templateId ?? null,
      taskConfig: data.taskConfig,
      recurrence: data.recurrence,
      cronExpression: data.cronExpression ?? null,
      nextRunAt: new Date(data.nextRunAt),
      isActive: data.isActive ?? true,
      createdById: userId,
    },
  }).catch(() => { throw new OfficeAiAdvError(ADV_STRINGS.error.CREATE_SCHEDULE_FAILED) })

  await writePlatformAuditLog({
    productKey: 'office_ai_assistant',
    action: 'SCHEDULE_CREATED',
    targetType: 'officeAiSchedule',
    targetId: record.id,
    actorId: userId,
    metadata: { name: data.name, recurrence: data.recurrence },
  })

  return mapSchedule(record)
}

export async function getSchedule(scheduleId: string): Promise<OfficeAiSchedule | null> {
  if (!scheduleId) return null
  const record = await p.officeAiSchedule.findUnique({
    where: { id: scheduleId },
  }).catch(() => null)
  return record ? mapSchedule(record) : null
}

export async function listSchedules(orgId: string): Promise<OfficeAiSchedule[]> {
  validateOrgId(orgId)
  const records = await p.officeAiSchedule.findMany({
    where: { organizationId: orgId },
    orderBy: { nextRunAt: 'asc' },
  }).catch(() => { throw new OfficeAiAdvError(ADV_STRINGS.error.FETCH_FAILED) })
  return records.map(mapSchedule)
}

export async function processDueSchedules(): Promise<number> {
  const now = new Date()
  const due = await p.officeAiSchedule.findMany({
    where: {
      isActive: true,
      nextRunAt: { lte: now },
    },
  }).catch(() => { throw new OfficeAiAdvError(ADV_STRINGS.error.PROCESS_SCHEDULES_FAILED) })

  let totalTasksCreated = 0
  for (const schedule of due) {
    const config = schedule.taskConfig as Record<string, any>
    const task = await prisma.officeAiTask.create({
      data: {
        platformOrganizationId: schedule.organizationId,
        taskType: config.taskType ?? 'general',
        title: config.title ?? schedule.name,
        instructions: config.description ?? null,
        status: 'draft',
        createdById: schedule.createdById,
        language: 'ar',
        metadata: {
          sourceScheduleId: schedule.id,
          ...(config.metadata ?? {}),
        },
      },
    }).catch(() => null)

    if (task) {
      totalTasksCreated++
    }

    await p.officeAiSchedule.update({
      where: { id: schedule.id },
      data: {
        lastRunAt: now,
        nextRunAt: computeNextRun(schedule.nextRunAt, schedule.recurrence),
      },
    })
  }

  if (totalTasksCreated > 0) {
    await writePlatformAuditLog({
      productKey: 'office_ai_assistant',
      action: 'SCHEDULE_PROCESSED',
      targetType: 'officeAiSchedule',
      metadata: { schedulesProcessed: due.length, tasksCreated: totalTasksCreated },
    })
  }

  return totalTasksCreated
}

// ─── Role Config ───

export async function createRoleConfig(
  orgId: string,
  data: CreateRoleConfigData,
  userId: string,
): Promise<OfficeAiRoleConfig> {
  validateOrgId(orgId)
  validateUserId(userId)
  if (!data.roleSlug) throw new OfficeAiAdvError(ADV_STRINGS.error.ROLE_SLUG_REQUIRED)
  if (data.confidenceThreshold !== undefined && (data.confidenceThreshold < 0 || data.confidenceThreshold > 1)) {
    throw new OfficeAiAdvError(ADV_STRINGS.error.CONFIDENCE_THRESHOLD_INVALID)
  }
  if (data.autoAssignThreshold !== undefined && data.autoAssignThreshold < 0) {
    throw new OfficeAiAdvError(ADV_STRINGS.error.AUTO_ASSIGN_INVALID)
  }
  if (data.maxTasksPerDay !== undefined && data.maxTasksPerDay <= 0) {
    throw new OfficeAiAdvError(ADV_STRINGS.error.MAX_TASKS_INVALID)
  }

  const validStyles = ['CONCISE', 'DETAILED', 'BALANCED']
  const responseStyle = data.responseStyle ?? 'BALANCED'
  if (!validStyles.includes(responseStyle)) {
    throw new OfficeAiAdvError('responseStyle must be CONCISE, DETAILED, or BALANCED')
  }

  const record = await p.officeAiRoleConfig.create({
    data: {
      organizationId: orgId,
      roleSlug: data.roleSlug,
      maxTasksPerDay: data.maxTasksPerDay ?? 10,
      allowedTaskTypes: data.allowedTaskTypes ?? [],
      requireApproval: data.requireApproval ?? false,
      autoAssignThreshold: data.autoAssignThreshold ?? 5,
      responseStyle,
      confidenceThreshold: data.confidenceThreshold ?? 0.7,
      createdById: userId,
    },
  }).catch(() => { throw new OfficeAiAdvError(ADV_STRINGS.error.CREATE_ROLE_CONFIG_FAILED) })

  await writePlatformAuditLog({
    productKey: 'office_ai_assistant',
    action: 'ROLE_CONFIG_CREATED',
    targetType: 'officeAiRoleConfig',
    targetId: record.id,
    actorId: userId,
    metadata: { roleSlug: data.roleSlug },
  })

  return mapRoleConfig(record)
}

export async function getRoleConfig(
  orgId: string,
  roleSlug: string,
): Promise<OfficeAiRoleConfig | null> {
  validateOrgId(orgId)
  if (!roleSlug) throw new OfficeAiAdvError(ADV_STRINGS.error.ROLE_SLUG_REQUIRED)
  const record = await p.officeAiRoleConfig.findFirst({
    where: { organizationId: orgId, roleSlug },
  }).catch(() => null)
  return record ? mapRoleConfig(record) : null
}

export async function listRoleConfigs(
  orgId: string,
): Promise<OfficeAiRoleConfig[]> {
  validateOrgId(orgId)
  const records = await p.officeAiRoleConfig.findMany({
    where: { organizationId: orgId },
    orderBy: { roleSlug: 'asc' },
  }).catch(() => [])
  return records.map(mapRoleConfig)
}

// ─── Task Stats ───

export async function getTaskStats(
  orgId: string,
  period?: { start: Date; end: Date },
): Promise<OfficeAiTaskStats> {
  validateOrgId(orgId)
  try {
    const end = period?.end ?? new Date()
    const start = period?.start ?? new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)

    const tasks = await prisma.officeAiTask.findMany({
      where: {
        platformOrganizationId: orgId,
        createdAt: { gte: start, lte: end },
      },
    })

    const total = tasks.length
    const completed = tasks.filter(
      (t: any) => t.status === 'finalized' || t.status === 'approved',
    ).length
    const overdue = tasks.filter(
      (t: any) =>
        t.status !== 'finalized' &&
        t.status !== 'approved' &&
        t.status !== 'archived',
    ).length

    const byType: Record<string, number> = {}
    for (const t of tasks) {
      const type = t.taskType ?? 'unknown'
      byType[type] = (byType[type] ?? 0) + 1
    }

    return {
      total,
      completed,
      overdue,
      completionRate: total > 0 ? completed / total : 0,
      overdueRate: total > 0 ? overdue / total : 0,
      byType,
      period: { start, end },
    }
  } catch {
    throw new OfficeAiAdvError(ADV_STRINGS.error.GET_STATS_FAILED)
  }
}
