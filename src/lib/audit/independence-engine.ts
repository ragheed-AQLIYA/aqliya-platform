// ─── AuditOS L6.2 Independence Engine ───
// محرك الاستقلالية لإدارة تضارب المصالح والتهديدات
// IESBA Code of Ethics, ISQM1 compliant

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuditActor } from "./actor-context";

// ─── Types ───

export type ThreatCategory = "self_interest" | "self_review" | "advocacy" | "familiarity" | "intimidation";
export type ThreatLevel = "low" | "moderate" | "significant";
export type ThreatStatus = "identified" | "assessed" | "mitigated" | "accepted" | "resolved";
export type SafeguardType = "organizational" | "procedural" | "application_of_professional_standards";
export type SafeguardStatus = "proposed" | "implemented" | "effective" | "expired";

const THREAT_CATEGORIES: { value: ThreatCategory; label: string; description: string }[] = [
  { value: "self_interest", label: "مصلحة ذاتية", description: "خطر منفعة مالية أو مصلحة شخصية" },
  { value: "self_review", label: "مراجعة ذاتية", description: "خطر مراجعة عمل سابق" },
  { value: "advocacy", label: "محاماة", description: "خطر الدفاع عن موقف العميل" },
  { value: "familiarity", label: "ألفة", description: "خطر العلاقة الوثيقة" },
  { value: "intimidation", label: "ترهيب", description: "خطر الضغط أو التهديد" },
];

// ─── Service ───

export class IndependenceEngine {
  // ==================== Register Management ====================

  async registerPerson(
    actor: AuditActor,
    data: {
      organizationId: string;
      entityId: string;
      entityName: string;
      entityRole: string;
      joinDate?: Date;
    },
  ) {
    const existing = await prisma.independenceRegister.findUnique({
      where: { organizationId_entityId: { organizationId: data.organizationId, entityId: data.entityId } },
    });

    if (existing) {
      return prisma.independenceRegister.update({
        where: { id: existing.id },
        data: { status: "active", entityRole: data.entityRole, joinDate: data.joinDate },
      });
    }

    return prisma.independenceRegister.create({
      data: {
        organizationId: data.organizationId,
        entityType: "person",
        entityId: data.entityId,
        entityName: data.entityName,
        entityRole: data.entityRole,
        joinDate: data.joinDate,
        createdById: actor.actorId,
      },
    });
  }

  async deactivateRegisterEntry(actor: AuditActor, id: string, leaveDate?: Date) {
    return prisma.independenceRegister.update({
      where: { id },
      data: { status: "inactive", leaveDate: leaveDate ?? new Date() },
    });
  }

  async listRegister(organizationId: string, roleFilter?: string) {
    const where: Record<string, unknown> = { organizationId };
    if (roleFilter) where.entityRole = roleFilter;

    return prisma.independenceRegister.findMany({
      where: where as Prisma.IndependenceRegisterWhereInput,
      include: {
        financialInterests: true,
        employmentRelationships: true,
        threats: { include: { safeguards: true } },
        annualConfirmations: { orderBy: { year: "desc" }, take: 1 },
      },
      orderBy: { entityName: "asc" },
    });
  }

  async getRegisterEntry(id: string) {
    return prisma.independenceRegister.findUnique({
      where: { id },
      include: {
        financialInterests: true,
        employmentRelationships: true,
        threats: { include: { safeguards: true } },
        annualConfirmations: { orderBy: { year: "desc" } },
      },
    });
  }

  // ==================== Financial Interests ====================

  async declareFinancialInterest(
    actor: AuditActor,
    data: {
      registerId: string;
      interestType: string;
      issuerName: string;
      issuerTicker?: string;
      amount?: number;
      currency?: string;
      dateAcquired?: Date;
    },
  ) {
    return prisma.financialInterest.create({
      data: {
        registerId: data.registerId,
        interestType: data.interestType,
        issuerName: data.issuerName,
        issuerTicker: data.issuerTicker,
        amount: data.amount,
        currency: data.currency ?? "SAR",
        dateAcquired: data.dateAcquired,
        selfDisclosed: true,
        createdById: actor.actorId,
      },
    });
  }

  async disposeFinancialInterest(id: string, dateDisposed: Date) {
    return prisma.financialInterest.update({
      where: { id },
      data: { dateDisposed },
    });
  }

  // ==================== Employment Relationships ====================

  async declareEmploymentRelationship(
    actor: AuditActor,
    data: {
      registerId: string;
      relatedEntityName: string;
      relatedEntityType: string;
      relationshipType: string;
      relationshipDescription?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    return prisma.employmentRelationship.create({
      data: {
        registerId: data.registerId,
        relatedEntityName: data.relatedEntityName,
        relatedEntityType: data.relatedEntityType,
        relationshipType: data.relationshipType,
        relationshipDescription: data.relationshipDescription,
        startDate: data.startDate,
        endDate: data.endDate,
        selfDisclosed: true,
        createdById: actor.actorId,
      },
    });
  }

  // ==================== Threat Assessment ====================

  async identifyThreat(
    actor: AuditActor,
    data: {
      registerId: string;
      clientId?: string;
      engagementId?: string;
      threatCategory: ThreatCategory;
      threatDescription: string;
      threatLevel: ThreatLevel;
    },
  ) {
    return prisma.independenceThreat.create({
      data: {
        registerId: data.registerId,
        clientId: data.clientId,
        engagementId: data.engagementId,
        threatCategory: data.threatCategory,
        threatDescription: data.threatDescription,
        threatLevel: data.threatLevel,
        identifiedById: actor.actorId,
      },
    });
  }

  async assessThreat(
    actor: AuditActor,
    id: string,
    threatLevel: ThreatLevel,
    status: ThreatStatus,
  ) {
    return prisma.independenceThreat.update({
      where: { id },
      data: {
        threatLevel,
        status,
        assessedById: actor.actorId,
        assessedAt: new Date(),
      },
    });
  }

  async listThreats(organizationId: string, filters?: { status?: string; category?: string }) {
    const where: Record<string, unknown> = {
      register: { organizationId },
    };
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.threatCategory = filters.category;

    return prisma.independenceThreat.findMany({
      where: where as Prisma.IndependenceRegisterWhereInput,
      include: {
        register: { select: { entityName: true, entityRole: true } },
        safeguards: true,
      },
      orderBy: { identifiedAt: "desc" },
    });
  }

  // ==================== Safeguards ====================

  async proposeSafeguard(
    actor: AuditActor,
    data: {
      threatId: string;
      safeguardType: SafeguardType;
      safeguardDescription: string;
    },
  ) {
    return prisma.independenceSafeguard.create({
      data: {
        threatId: data.threatId,
        safeguardType: data.safeguardType,
        safeguardDescription: data.safeguardDescription,
        createdById: actor.actorId,
      },
    });
  }

  async updateSafeguardStatus(
    id: string,
    status: SafeguardStatus,
    effectivenessReview?: string,
  ) {
    const data: Record<string, unknown> = { status };
    if (status === "implemented") data.implementedAt = new Date();
    if (effectivenessReview) data.effectivenessReview = effectivenessReview;

    return prisma.independenceSafeguard.update({
      where: { id },
      data,
    });
  }

  // ==================== Conflict Check ====================

  async runConflictCheck(
    actor: AuditActor,
    clientId: string,
    clientName: string,
  ) {
    // Get all active persons in the firm
    const register = await prisma.independenceRegister.findMany({
      where: { organizationId: actor.organizationId, status: "active" },
      include: {
        financialInterests: true,
        employmentRelationships: {
          where: { relatedEntityName: { contains: clientName } },
        },
      },
    });

    const conflicts: Array<{
      personName: string;
      personRole: string;
      conflictType: string;
      description: string;
      severity: string;
    }> = [];

    for (const entry of register) {
      // Check employment relationships with this client
      for (const rel of entry.employmentRelationships) {
        if (
          rel.relatedEntityName.toLowerCase().includes(clientName.toLowerCase()) ||
          clientName.toLowerCase().includes(rel.relatedEntityName.toLowerCase())
        ) {
          conflicts.push({
            personName: entry.entityName,
            personRole: entry.entityRole ?? "",
            conflictType: "employment",
            description: `${rel.relationshipType} at ${rel.relatedEntityName}`,
            severity: "high",
          });
        }
      }

      // Check if person has a threat related to this client
      const clientThreats = await prisma.independenceThreat.findFirst({
        where: { registerId: entry.id, clientId },
      });
      if (clientThreats) {
        conflicts.push({
          personName: entry.entityName,
          personRole: entry.entityRole ?? "",
          conflictType: "existing_threat",
          description: clientThreats.threatDescription ?? "",
          severity: (clientThreats.threatLevel === "significant" ? "high" : "medium") as string,
        });
      }
    }

    return {
      clientId,
      clientName,
      checkedAt: new Date().toISOString(),
      checkedById: actor.actorId,
      checkedByName: actor.actorName,
      totalConflicts: conflicts.length,
      highSeverity: conflicts.filter(c => c.severity === "high").length,
      conflicts,
      status: conflicts.length === 0 ? "passed" : "flagged",
    };
  }

  // ==================== Annual Confirmation ====================

  async createConfirmationCycle(
    actor: AuditActor,
    organizationId: string,
    year: number,
  ) {
    // Find all active register entries
    const activeEntries = await prisma.independenceRegister.findMany({
      where: { organizationId, status: "active" },
    });

    // Create pending confirmation for each
    const confirmations = await Promise.all(
      activeEntries.map(entry =>
        prisma.annualIndependenceConfirmation.upsert({
          where: { registerId_year: { registerId: entry.id, year } },
          create: {
            organizationId,
            registerId: entry.id,
            year,
            createdById: actor.actorId,
          },
          update: {
            status: "pending",
          },
        }),
      ),
    );

    return {
      year,
      totalConfirmations: confirmations.length,
    };
  }

  async submitConfirmation(
    actor: AuditActor,
    id: string,
    interestsDeclared?: Record<string, unknown>,
    relationshipsDeclared?: Record<string, unknown>,
  ) {
    return prisma.annualIndependenceConfirmation.update({
      where: { id },
      data: {
        status: "completed",
        confirmedAt: new Date(),
        interestsDeclared: interestsDeclared as Prisma.InputJsonValue,
        relationshipsDeclared: relationshipsDeclared as Prisma.InputJsonValue,
        signedById: actor.actorId,
      },
    });
  }

  async reviewConfirmation(
    actor: AuditActor,
    id: string,
    reviewedNotes: string,
    status: "completed" | "flagged",
  ) {
    return prisma.annualIndependenceConfirmation.update({
      where: { id },
      data: {
        status,
        reviewedById: actor.actorId,
        reviewedAt: new Date(),
        reviewedNotes,
      },
    });
  }

  async getConfirmationStatus(organizationId: string, year: number) {
    const confirmations = await prisma.annualIndependenceConfirmation.findMany({
      where: { organizationId, year },
      include: {
        register: { select: { entityName: true, entityRole: true } },
      },
    });

    return {
      year,
      total: confirmations.length,
      completed: confirmations.filter(c => c.status === "completed").length,
      flagged: confirmations.filter(c => c.status === "flagged").length,
      pending: confirmations.filter(c => c.status === "pending").length,
      confirmations,
    };
  }

  // ==================== Dashboard ====================

  async getDashboard(organizationId: string) {
    const [
      totalRegistered,
      activePersons,
      openThreats,
      significantThreats,
      pendingConfirmations,
      recentThreats,
    ] = await Promise.all([
      prisma.independenceRegister.count({ where: { organizationId } }),
      prisma.independenceRegister.count({ where: { organizationId, status: "active" } }),
      prisma.independenceThreat.count({
        where: { status: { in: ["identified", "assessed", "mitigated"] }, register: { organizationId } },
      }),
      prisma.independenceThreat.count({
        where: { threatLevel: "significant", register: { organizationId } },
      }),
      prisma.annualIndependenceConfirmation.count({
        where: { organizationId, status: "pending" },
      }),
      prisma.independenceThreat.findMany({
        where: { register: { organizationId } },
        include: { register: { select: { entityName: true } } },
        orderBy: { identifiedAt: "desc" },
        take: 5,
      }),
    ]);

    return {
      totalRegistered,
      activePersons,
      openThreats,
      significantThreats,
      pendingConfirmations,
      recentThreats,
    };
  }

  // ==================== Utilities ====================

  getThreatCategories() {
    return THREAT_CATEGORIES;
  }
}

export const independenceEngine = new IndependenceEngine();

