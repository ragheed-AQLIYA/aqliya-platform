// ─── بذر الصلاحيات النظامية والأدوار ───
// يقوم بإنشاء جميع الصلاحيات القياسية والأدوار النظامية.
// آمن للتشغيل المتكرر (upsert).

import { prisma } from "@/lib/prisma";
import { getOrCreateSystemRoles } from "./rbac-service";
import { auditLogger, Product } from "../audit-logger";

interface PermissionDef {
  name: string;
  slug: string;
  group: string;
  description?: string;
}

const PERMISSION_DEFINITIONS: PermissionDef[] = [
  // audit.engagement
  { name: "Read Engagements", slug: "audit.engagement.read", group: "audit.engagement", description: "View audit engagement details" },
  { name: "Write Engagements", slug: "audit.engagement.write", group: "audit.engagement", description: "Create and update engagements" },
  { name: "Delete Engagements", slug: "audit.engagement.delete", group: "audit.engagement", description: "Delete engagements" },
  { name: "Admin Engagements", slug: "audit.engagement.admin", group: "audit.engagement", description: "Full administrative access to engagements" },
  { name: "Export Engagements", slug: "audit.engagement.export", group: "audit.engagement", description: "Export engagement data" },

  // audit.evidence
  { name: "Read Evidence", slug: "audit.evidence.read", group: "audit.evidence", description: "View evidence items" },
  { name: "Write Evidence", slug: "audit.evidence.write", group: "audit.evidence", description: "Create and update evidence" },
  { name: "Delete Evidence", slug: "audit.evidence.delete", group: "audit.evidence", description: "Delete evidence" },
  { name: "Upload Evidence", slug: "audit.evidence.upload", group: "audit.evidence", description: "Upload evidence files" },
  { name: "Download Evidence", slug: "audit.evidence.download", group: "audit.evidence", description: "Download evidence files" },

  // audit.review
  { name: "Read Reviews", slug: "audit.review.read", group: "audit.review", description: "View review comments" },
  { name: "Write Reviews", slug: "audit.review.write", group: "audit.review", description: "Add review comments" },
  { name: "Approve Reviews", slug: "audit.review.approve", group: "audit.review", description: "Approve review items" },
  { name: "Reject Reviews", slug: "audit.review.reject", group: "audit.review", description: "Reject review items" },

  // decision
  { name: "Read Decisions", slug: "decision.read", group: "decision", description: "View decisions" },
  { name: "Write Decisions", slug: "decision.write", group: "decision", description: "Create and update decisions" },
  { name: "Delete Decisions", slug: "decision.delete", group: "decision", description: "Delete decisions" },
  { name: "Approve Decisions", slug: "decision.approve", group: "decision", description: "Approve decisions" },
  { name: "Reject Decisions", slug: "decision.reject", group: "decision", description: "Reject decisions" },
  { name: "Export Decisions", slug: "decision.export", group: "decision", description: "Export decision data" },
  { name: "Admin Decisions", slug: "decision.admin", group: "decision", description: "Full administrative access to decisions" },

  // localcontent
  { name: "Read LocalContent", slug: "localcontent.read", group: "localcontent", description: "View local content data" },
  { name: "Write LocalContent", slug: "localcontent.write", group: "localcontent", description: "Create and update local content" },
  { name: "Delete LocalContent", slug: "localcontent.delete", group: "localcontent", description: "Delete local content" },
  { name: "Admin LocalContent", slug: "localcontent.admin", group: "localcontent", description: "Full administrative access to local content" },
  { name: "Export LocalContent", slug: "localcontent.export", group: "localcontent", description: "Export local content data" },

  // settings
  { name: "Read Settings", slug: "settings.read", group: "settings", description: "View system settings" },
  { name: "Write Settings", slug: "settings.write", group: "settings", description: "Update system settings" },
  { name: "Admin Settings", slug: "settings.admin", group: "settings", description: "Full administrative access to settings" },

  // user
  { name: "Read Users", slug: "user.read", group: "user", description: "View user profiles" },
  { name: "Write Users", slug: "user.write", group: "user", description: "Create and update users" },
  { name: "Admin Users", slug: "user.admin", group: "user", description: "Full administrative access to users" },
  { name: "Manage Roles", slug: "user.manage_roles", group: "user", description: "Assign and revoke roles" },

  // platform
  { name: "Read Platform", slug: "platform.read", group: "platform", description: "View platform configuration" },
  { name: "Admin Platform", slug: "platform.admin", group: "platform", description: "Full platform administration" },
  { name: "Manage Secrets", slug: "platform.manage_secrets", group: "platform", description: "Manage platform secrets" },
  { name: "Manage SIEM", slug: "platform.manage_siem", group: "platform", description: "Manage SIEM integration" },
  { name: "Manage Retention", slug: "platform.manage_retention", group: "platform", description: "Manage data retention policies" },

  // workflow
  { name: "Read Workflows", slug: "workflow.read", group: "workflow", description: "View workflow definitions and records" },
  { name: "Write Workflows", slug: "workflow.write", group: "workflow", description: "Create and update workflows" },
  { name: "Delete Workflows", slug: "workflow.delete", group: "workflow", description: "Delete workflows" },
  { name: "Admin Workflows", slug: "workflow.admin", group: "workflow", description: "Full administrative access to workflows" },
  { name: "Execute Workflows", slug: "workflow.execute", group: "workflow", description: "Execute workflow actions" },
  { name: "Export Workflows", slug: "workflow.export", group: "workflow", description: "Export workflow data" },
];

/**
 * يقوم بإنشاء جميع الصلاحيات القياسية في قاعدة البيانات.
 * آمن للتشغيل المتكرر — يستخدم upsert على slug.
 */
export async function seedSystemPermissions(): Promise<number> {
  let count = 0;

  for (const def of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        group: def.group,
        description: def.description ?? null,
      },
      create: {
        name: def.name,
        slug: def.slug,
        group: def.group,
        description: def.description ?? null,
      },
    });
    count++;
  }

  await getOrCreateSystemRoles();

  await auditLogger({
    productKey: Product.PLATFORM,
  }).record("permissions.seeded", undefined, {
    metadata: { permissionCount: count },
  });

  return count;
}
