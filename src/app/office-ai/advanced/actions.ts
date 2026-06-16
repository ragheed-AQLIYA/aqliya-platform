"use server"

import { unstable_noStore as noStore } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import {
  createWorkflowTemplate,
  listWorkflowTemplates,
  createSchedule,
  listSchedules,
  processDueSchedules,
  getTaskStats,
  getRoleConfig,
  listRoleConfigs,
  OfficeAiAdvError,
} from "@/lib/platform/office-ai-adv"
import type {
  CreateWorkflowTemplateData,
  CreateScheduleData,
} from "@/lib/platform/office-ai-adv"

function getOrgId(user: Awaited<ReturnType<typeof getCurrentUser>>): string {
  return user.platformOrganizationId || user.organizationId
}

export async function getAdvStats(period?: { start: Date; end: Date }) {
  noStore()
  const user = await getCurrentUser()
  const orgId = getOrgId(user)
  return getTaskStats(orgId, period)
}

export async function getAdvTemplates() {
  noStore()
  const user = await getCurrentUser()
  const orgId = getOrgId(user)
  return listWorkflowTemplates(orgId)
}

export async function createAdvTemplate(data: CreateWorkflowTemplateData) {
  const user = await getCurrentUser()
  const orgId = getOrgId(user)
  return createWorkflowTemplate(orgId, data, user.id)
}

export async function getAdvSchedules() {
  noStore()
  const user = await getCurrentUser()
  const orgId = getOrgId(user)
  return listSchedules(orgId)
}

export async function createAdvSchedule(data: CreateScheduleData) {
  const user = await getCurrentUser()
  const orgId = getOrgId(user)
  return createSchedule(orgId, data, user.id)
}

export async function processDueSchedulesAction() {
  const user = await getCurrentUser()
  const tasksCreated = await processDueSchedules()
  return { tasksCreated }
}

export async function getAdvRoleConfig(roleSlug?: string) {
  noStore()
  const user = await getCurrentUser()
  const orgId = getOrgId(user)
  if (roleSlug) return getRoleConfig(orgId, roleSlug)
  return listRoleConfigs(orgId)
}

export type ActionState<T = unknown> =
  | { status: "idle" | "success"; data?: T }
  | { status: "error"; error: string }

export async function createAdvTemplateAction(
  prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const stepsRaw = formData.get("steps") as string

    const steps = stepsRaw ? JSON.parse(stepsRaw) : []
    const data = await createAdvTemplate({ name, description: description || undefined, steps })
    return { status: "success", data }
  } catch (err) {
    const message = err instanceof OfficeAiAdvError ? err.message : "فشل في إنشاء القالب"
    return { status: "error", error: message }
  }
}

export async function createAdvScheduleAction(
  prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const name = formData.get("name") as string
    const recurrence = formData.get("recurrence") as string
    const nextRunAtStr = formData.get("nextRunAt") as string

    const data = await createAdvSchedule({
      name,
      recurrence,
      nextRunAt: new Date(nextRunAtStr),
      taskConfig: {},
    })
    return { status: "success", data }
  } catch (err) {
    const message = err instanceof OfficeAiAdvError ? err.message : "فشل في إنشاء الجدول"
    return { status: "error", error: message }
  }
}
