import 'server-only'

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import {
  OfficeAiAdvError,
  type OfficeAiWorkflowTemplate,
  type CreateWorkflowTemplateData,
  validateOrgId,
  validateUserId,
  replaceVariables,
  mapTemplate,
} from './common'
import { ADV_STRINGS } from '../adv-strings'

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

  const record = await prisma.officeAiWorkflowTemplate.create({
    data: {
      organizationId: orgId,
      name: data.name,
      description: data.description ?? null,
      steps: data.steps as unknown as Prisma.InputJsonValue,
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
  const record = await prisma.officeAiWorkflowTemplate.findUnique({
    where: { id: templateId },
  }).catch(() => null)
  return record ? mapTemplate(record) : null
}

export async function listWorkflowTemplates(orgId: string): Promise<OfficeAiWorkflowTemplate[]> {
  validateOrgId(orgId)
  const records = await prisma.officeAiWorkflowTemplate.findMany({
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

  const taskData = template.steps.map((step) => ({
    platformOrganizationId: template.organizationId,
    taskType: step.taskType,
    title: replaceVariables(step.title, context),
    instructions: replaceVariables(step.description, context),
    status: 'draft' as const,
    createdById: userId,
    language: 'ar',
    metadata: {
      workflowTemplateId: templateId,
      stepOrder: step.stepOrder,
      assignedRoleSlug: step.assignedRoleSlug,
      estimatedHours: step.estimatedHours,
      priority: step.defaultPriority,
    },
  }))

  await prisma.officeAiTask.createMany({ data: taskData })

  const createdTasks = await prisma.officeAiTask.findMany({
    where: {
      platformOrganizationId: template.organizationId,
      createdAt: { gte: new Date(Date.now() - 5000) },
    },
    orderBy: { createdAt: 'asc' },
    take: taskData.length,
  })

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
