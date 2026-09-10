"use server"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { Prisma } from "@/generated/prisma/client"

async function assertUser() {
  const user = await getCurrentUser()
  if (!user) throw new Error("Authentication required")
  return user
}

export async function createNotification(params: {
  organizationId: string
  userId: string
  type: string
  title: string
  body?: string
  link?: string
  metadata?: Record<string, unknown>
}) {
  return prisma.notification.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
      metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
    },
  })
}

export async function getUnreadNotifications(limit = 20) {
  const user = await assertUser()
  return prisma.notification.findMany({
    where: { userId: user.id, read: false },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getNotifications(limit = 50, offset = 0) {
  const user = await assertUser()
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where: { userId: user.id } }),
  ])
  return { notifications, total }
}

export async function markAsRead(notificationId: string) {
  const user = await assertUser()
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { read: true, readAt: new Date() },
  })
  revalidatePath("/notifications")
  return { success: true }
}

export async function markAllAsRead() {
  const user = await assertUser()
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true, readAt: new Date() },
  })
  revalidatePath("/notifications")
  return { success: true }
}

export async function getUnreadCount() {
  const user = await assertUser().catch(() => null)
  if (!user) return 0
  return prisma.notification.count({
    where: { userId: user.id, read: false },
  })
}
