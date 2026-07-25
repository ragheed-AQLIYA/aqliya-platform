import 'server-only'

import type { Prisma } from '@prisma/client'
import { ADV_STRINGS } from '../adv-strings'

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

// ─── Constants ───

export const VALID_RECURRENCE = ['DAILY', 'WEEKLY', 'MONTHLY'] as const

// ─── Validators ───

export function validateOrgId(orgId: string): void {
  if (!orgId) throw new OfficeAiAdvError(ADV_STRINGS.error.ORG_ID_REQUIRED)
}

export function validateUserId(userId: string): void {
  if (!userId) throw new OfficeAiAdvError(ADV_STRINGS.error.USER_ID_REQUIRED)
}

// ─── Helpers ───

export function replaceVariables(template: string, context: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    if (context[key] === undefined) {
      throw new OfficeAiAdvError(`${ADV_STRINGS.error.CONTEXT_VARIABLE_MISSING}: ${key}`)
    }
    return context[key]
  })
}

export function computeNextRun(current: Date, recurrence: string): Date {
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

// ─── Mappers ───

export function mapTemplate(record: any): OfficeAiWorkflowTemplate {
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

export function mapSchedule(record: any): OfficeAiSchedule {
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

export function mapRoleConfig(record: any): OfficeAiRoleConfig {
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
