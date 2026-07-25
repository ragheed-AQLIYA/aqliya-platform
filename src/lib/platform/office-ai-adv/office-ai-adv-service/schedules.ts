import 'server-only'

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import {
  OfficeAiAdvError,
  type OfficeAiSchedule,
  type CreateScheduleData,
  VALID_RECURRENCE,
  validateOrgId,
  validateUserId,
  computeNextRun,
  mapSchedule,
} from './common'
import { ADV_STRINGS } from '../adv-strings'

export async function createSchedule(
  orgId: string,
  data: CreateScheduleData,
  userId: string,
): Promise<OfficeAiSchedule> {
  validateOrgId(orgId)
  validateUserId(userId)
  if (!data.name) throw new OfficeAiAdvError(ADV_STRINGS.error.SCHEDULE_NAME_REQUIRED)
  if (!(VALID_RECURRENCE as readonly string[]).includes(data.recurrence)) {
    throw new OfficeAiAdvError(ADV_STRINGS.error.INVALID_RECURRENCE)
  }
  if (!data.nextRunAt) {
    throw new OfficeAiAdvError('nextRunAt is required')
  }

  const record = await prisma.officeAiSchedule.create({
    data: {
      organizationId: orgId,
      name: data.name,
      templateId: data.templateId ?? null,
      taskConfig: data.taskConfig as unknown as Prisma.InputJsonValue,
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
  const record = await prisma.officeAiSchedule.findUnique({
    where: { id: scheduleId },
  }).catch(() => null)
  return record ? mapSchedule(record) : null
}

export async function listSchedules(orgId: string): Promise<OfficeAiSchedule[]> {
  validateOrgId(orgId)
  const records = await prisma.officeAiSchedule.findMany({
    take: 100,
    where: { organizationId: orgId },
    orderBy: { nextRunAt: 'asc' },
  }).catch(() => { throw new OfficeAiAdvError(ADV_STRINGS.error.FETCH_FAILED) })
  return records.map(mapSchedule)
}

export async function processDueSchedules(): Promise<number> {
  const now = new Date()
  const due = await prisma.officeAiSchedule.findMany({
    take: 100,
    where: {
      isActive: true,
      nextRunAt: { lte: now },
    },
  }).catch(() => { throw new OfficeAiAdvError(ADV_STRINGS.error.PROCESS_SCHEDULES_FAILED) })

  const taskData: Array<{
    platformOrganizationId: string
    taskType: string
    title: string
    instructions: string | null
    status: string
    createdById: string
    language: string
    metadata: Prisma.InputJsonValue
  }> = []

  for (const schedule of due) {
    const config = schedule.taskConfig as Record<string, any>
    taskData.push({
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
      } as Prisma.InputJsonValue,
    })
  }

  if (taskData.length > 0) {
    await prisma.officeAiTask.createMany({ data: taskData })
  }

  await Promise.all(
    due.map((schedule) =>
      prisma.officeAiSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: now,
          nextRunAt: computeNextRun(schedule.nextRunAt ?? new Date(), schedule.recurrence ?? ""),
        },
      }),
    ),
  )

  const totalTasksCreated = taskData.length

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
