"use server"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"
import { revalidatePath } from "next/cache"

export type UserPreferences = {
  language: "ar" | "en"
  theme: "light" | "dark" | "system"
  notifications: {
    email: boolean
    inApp: boolean
    taskAssigned: boolean
    reviewRequested: boolean
    approvalRequired: boolean
    systemUpdates: boolean
  }
  timezone: string
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: "ar",
  theme: "light",
  notifications: {
    email: true,
    inApp: true,
    taskAssigned: true,
    reviewRequested: true,
    approvalRequired: true,
    systemUpdates: false,
  },
  timezone: "Asia/Riyadh",
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Authentication required")

  try {
    const preferences = await prisma.user.findUnique({
      where: { id: user.id },
      select: { preferences: true },
    })

    if (preferences?.preferences && typeof preferences.preferences === "object") {
      return {
        ...DEFAULT_PREFERENCES,
        ...(preferences.preferences as Partial<UserPreferences>),
      }
    }
  } catch {
    // Fall through to defaults
  }

  return DEFAULT_PREFERENCES
}

export async function updateUserPreferences(updates: Partial<UserPreferences>) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Authentication required")

  const current = await getUserPreferences()
  const merged = { ...current, ...updates }

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences: merged as Prisma.InputJsonValue },
  })

  revalidatePath("/settings")
  return merged
}
