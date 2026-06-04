"use server"

import { prisma } from "@/lib/prisma"
import { requireEnabled } from "@/lib/platform/feature-flags/registry"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export interface RegisterTenantInput {
  organizationName: string
  adminName: string
  adminEmail: string
  password: string
}

export interface RegisterTenantResult {
  ok: true
  platformOrganizationId: string
  organizationId: string
  userId: string
  workspaceId: string
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export async function registerTenantAction(
  input: RegisterTenantInput,
): Promise<RegisterTenantResult> {
  requireEnabled("tenant.self-service")

  const { organizationName, adminName, adminEmail, password } = input

  if (!organizationName || organizationName.trim().length < 2) {
    throw new Error("اسم المؤسسة يجب أن يكون 2 أحرف على الأقل")
  }
  if (!adminName || adminName.trim().length < 1) {
    throw new Error("الرجاء إدخال اسم المدير")
  }
  if (!adminEmail || !adminEmail.includes("@")) {
    throw new Error("الرجاء إدخال بريد إلكتروني صحيح")
  }
  if (!password || password.length < 8) {
    throw new Error("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
  }

  const slug = toSlug(organizationName)
  if (!slug) {
    throw new Error("اسم المؤسسة غير صالح — يجب أن يحتوي على أحرف لاتينية")
  }

  const existingOrg = await prisma.platformOrganization.findUnique({ where: { slug } })
  if (existingOrg) {
    throw new Error(`يوجد مؤسسة مسجلة بالفعل بالاسم "${organizationName}"`)
  }

  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existingUser) {
    throw new Error("البريد الإلكتروني مسجل بالفعل")
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const result = await prisma.$transaction(async (tx) => {
    const platformOrg = await tx.platformOrganization.create({
      data: {
        slug,
        name: organizationName,
        displayName: organizationName,
        status: "pending_setup",
      },
    })

    const org = await tx.organization.create({
      data: {
        name: organizationName,
        platformOrganizationId: platformOrg.id,
      },
    })

    const user = await tx.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash,
        role: "ADMIN",
        organizationId: org.id,
      },
    })

    const workspace = await tx.clientWorkspace.create({
      data: {
        platformOrganizationId: platformOrg.id,
        name: "مساحة العمل الرئيسية",
        slug: "default",
        workspaceType: "client",
        status: "active",
        createdById: user.id,
      },
    })

    await tx.platformAuditLog.create({
      data: {
        productKey: "platform",
        action: "tenant.created",
        platformOrganizationId: platformOrg.id,
        actorId: user.id,
        actorEmail: adminEmail,
        actorName: adminName,
        targetType: "platform_organization",
        targetId: platformOrg.id,
        targetLabel: organizationName,
        severity: "info",
        status: "success",
        sourceSystem: "registration_actions",
        metadata: { slug, organizationName },
      },
    })

    await tx.platformAuditLog.create({
      data: {
        productKey: "platform",
        action: "user.registered",
        platformOrganizationId: platformOrg.id,
        actorId: user.id,
        actorEmail: adminEmail,
        actorName: adminName,
        targetType: "user",
        targetId: user.id,
        severity: "info",
        status: "success",
        sourceSystem: "registration_actions",
      },
    })

    await tx.platformAuditLog.create({
      data: {
        productKey: "platform",
        action: "workspace.created",
        platformOrganizationId: platformOrg.id,
        clientWorkspaceId: workspace.id,
        actorId: user.id,
        actorEmail: adminEmail,
        actorName: adminName,
        targetType: "client_workspace",
        targetId: workspace.id,
        targetLabel: "مساحة العمل الرئيسية",
        severity: "info",
        status: "success",
        sourceSystem: "registration_actions",
      },
    })

    return {
      platformOrganizationId: platformOrg.id,
      organizationId: org.id,
      userId: user.id,
      workspaceId: workspace.id,
    }
  })

  return { ok: true, ...result }
}

export interface InviteTeamMemberInput {
  email: string
  role: string
}

export interface InviteTeamMemberResult {
  id: string
  email: string
  role: string
  expiresAt: string
  inviteUrl: string
}

export async function inviteTeamMemberAction(
  input: InviteTeamMemberInput,
): Promise<InviteTeamMemberResult> {
  const { requireUserContext } = await import("@/lib/auth")
  const user = await requireUserContext("ADMIN")

  const { email, role } = input

  if (!email || !email.includes("@")) {
    throw new Error("الرجاء إدخال بريد إلكتروني صحيح")
  }

  const validRoles = ["ADMIN", "OPERATOR", "VIEWER"]
  if (!validRoles.includes(role)) {
    throw new Error("صلاحية غير صالحة")
  }

  const organizationId = user.organizationId

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new Error("المستخدم مسجل بالفعل في المنصة")
  }

  const existingInvite = await prisma.invitation.findFirst({
    where: {
      email,
      organizationId,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  })
  if (existingInvite) {
    throw new Error("تم إرسال دعوة لهذا البريد مسبقاً")
  }

  const platformOrg = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { platformOrganizationId: true },
  })

  const token = crypto.randomBytes(32).toString("hex")
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const invitation = await prisma.invitation.create({
    data: {
      email,
      tokenHash,
      role,
      organizationId,
      expiresAt,
      invitedByUserId: user.id,
    },
  })

  await writePlatformAuditLog({
    productKey: "platform",
    action: "invitation.sent",
    platformOrganizationId: platformOrg?.platformOrganizationId ?? undefined,
    actorId: user.id,
    actorEmail: user.email ?? undefined,
    actorName: user.name ?? undefined,
    targetType: "invitation",
    targetId: invitation.id,
    severity: "info",
    status: "recorded",
    sourceSystem: "registration_actions",
    metadata: { email, role },
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const inviteUrl = `${baseUrl}/invite/${token}`

  return {
    id: invitation.id,
    email,
    role,
    expiresAt: expiresAt.toISOString(),
    inviteUrl,
  }
}

export interface AcceptInvitationInput {
  token: string
  name: string
  password: string
}

export interface InvitationDetails {
  email: string
  role: string
  organizationName: string
}

export async function verifyInvitationAction(token: string): Promise<InvitationDetails | null> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash },
  })

  if (!invitation) return null
  if (invitation.acceptedAt) return null
  if (invitation.expiresAt < new Date()) return null
  if (!invitation.organizationId) return null

  const org = await prisma.organization.findUnique({
    where: { id: invitation.organizationId },
    select: { name: true },
  })
  if (!org) return null

  return {
    email: invitation.email,
    role: invitation.role,
    organizationName: org.name,
  }
}

export async function acceptInvitationAction(input: AcceptInvitationInput): Promise<void> {
  const { token, name, password } = input

  if (!name || name.trim().length < 1) {
    throw new Error("الرجاء إدخال الاسم")
  }
  if (!password || password.length < 8) {
    throw new Error("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash },
  })

  if (!invitation) {
    throw new Error("الدعوة غير صالحة أو منتهية الصلاحية")
  }

  if (invitation.acceptedAt) {
    throw new Error("تم استخدام هذه الدعوة مسبقاً")
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error("انتهت صلاحية الدعوة")
  }

  if (!invitation.organizationId) {
    throw new Error("الدعوة غير مرتبطة بمنشأة")
  }

  const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } })
  if (existingUser) {
    throw new Error("البريد الإلكتروني مسجل بالفعل")
  }

  const org = await prisma.organization.findUnique({
    where: { id: invitation.organizationId },
    select: { id: true, platformOrganizationId: true },
  })
  if (!org) {
    throw new Error("المنشأة غير موجودة")
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: invitation.email,
        name,
        passwordHash,
        role: invitation.role as "ADMIN" | "OPERATOR" | "VIEWER",
        organizationId: invitation.organizationId!,
      },
    })

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    })

    await tx.platformAuditLog.create({
      data: {
        productKey: "platform",
        action: "invitation.accepted",
        platformOrganizationId: org.platformOrganizationId,
        actorId: user.id,
        actorEmail: invitation.email,
        targetType: "invitation",
        targetId: invitation.id,
        severity: "info",
        status: "success",
        sourceSystem: "registration_actions",
        metadata: { email: invitation.email, role: invitation.role },
      },
    })
  })
}

export interface TeamMember {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

export async function listTeamMembersAction(): Promise<TeamMember[]> {
  const { requireUserContext } = await import("@/lib/auth")
  const user = await requireUserContext()

  const members = await prisma.user.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  })

  return members.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }))
}

export interface PendingInvitation {
  id: string
  email: string
  role: string
  expiresAt: string
  createdAt: string
}

export async function listPendingInvitationsAction(): Promise<PendingInvitation[]> {
  const { requireUserContext } = await import("@/lib/auth")
  const user = await requireUserContext("ADMIN")

  const invites = await prisma.invitation.findMany({
    where: {
      organizationId: user.organizationId,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      createdAt: true,
    },
  })

  return invites.map((inv) => ({
    ...inv,
    expiresAt: inv.expiresAt.toISOString(),
    createdAt: inv.createdAt.toISOString(),
  }))
}
