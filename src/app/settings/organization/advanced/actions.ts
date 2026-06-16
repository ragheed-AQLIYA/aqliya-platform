"use server"

import { unstable_noStore as noStore } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import {
  getOrgTree,
  getChildOrgs,
  getParentChain,
  getOrgSettings,
  setOrgSetting,
  deleteOrgSetting,
  getOrgHealth,
  getLifecycleEvents,
  OrgAdvError,
  KNOWN_SETTINGS,
} from "@/lib/platform/org-advanced"
import type { LifecycleEventFilter } from "@/lib/platform/org-advanced"

function getOrgId(user: Awaited<ReturnType<typeof getCurrentUser>>): string {
  return user.platformOrganizationId || user.organizationId
}

export async function getOrgHierarchyData() {
  noStore()
  const user = await getCurrentUser()
  const orgId = getOrgId(user)
  const [tree, children, parentChain] = await Promise.all([
    getOrgTree(orgId),
    getChildOrgs(orgId),
    getParentChain(orgId),
  ])
  return { tree, children, parentChain }
}

export async function getOrgSettingsData() {
  noStore()
  const user = await getCurrentUser()
  const orgId = getOrgId(user)
  return getOrgSettings(orgId)
}

export async function getOrgHealthData() {
  noStore()
  const user = await getCurrentUser()
  const orgId = getOrgId(user)
  return getOrgHealth(orgId)
}

export async function setOrgSettingValue(key: string, value: string) {
  const user = await getCurrentUser()
  const orgId = getOrgId(user)
  return setOrgSetting(orgId, key, value, user.id)
}

export async function deleteOrgSettingValue(key: string) {
  const user = await getCurrentUser()
  const orgId = getOrgId(user)
  return deleteOrgSetting(orgId, key)
}

export async function getLifecycleEventsData(filter?: LifecycleEventFilter) {
  noStore()
  const user = await getCurrentUser()
  const orgId = getOrgId(user)
  return getLifecycleEvents(orgId, filter)
}

export type OrgActionState<T = unknown> =
  | { status: "idle" | "success"; data?: T }
  | { status: "error"; error: string }

export async function setOrgSettingAction(
  prev: OrgActionState,
  formData: FormData,
): Promise<OrgActionState> {
  try {
    const key = formData.get("key") as string
    const value = formData.get("value") as string
    if (!key) {
      return { status: "error", error: "مفتاح الإعداد مطلوب" }
    }
    const data = await setOrgSettingValue(key, value)
    return { status: "success", data }
  } catch (err) {
    const message = err instanceof OrgAdvError ? err.message : "فشل في تحديث الإعداد"
    return { status: "error", error: message }
  }
}

export async function deleteOrgSettingAction(
  prev: OrgActionState,
  formData: FormData,
): Promise<OrgActionState> {
  try {
    const key = formData.get("key") as string
    if (!key) {
      return { status: "error", error: "مفتاح الإعداد مطلوب" }
    }
    await deleteOrgSettingValue(key)
    return { status: "success" }
  } catch (err) {
    const message = err instanceof OrgAdvError ? err.message : "فشل في حذف الإعداد"
    return { status: "error", error: message }
  }
}

export const KNOWN_SETTINGS_META: Record<string, { label: string; type: "text" | "number" | "boolean" }> = {
  default_locale: { label: "اللغة الافتراضية (default_locale)", type: "text" },
  timezone: { label: "المنطقة الزمنية (timezone)", type: "text" },
  max_users: { label: "الحد الأقصى للمستخدمين (max_users)", type: "number" },
  require_mfa: { label: "طلب التحقق متعدد العوامل (require_mfa)", type: "boolean" },
  audit_retention_days: { label: "فترة الاحتفاظ بالتدقيق (audit_retention_days)", type: "number" },
  content_approval_required: { label: "الموافقة على المحتوى مطلوبة (content_approval_required)", type: "boolean" },
}
