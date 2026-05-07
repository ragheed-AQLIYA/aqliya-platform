import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schemas
export const acknowledgeSignalSchema = z.object({
  signalId: z.string().cuid(),
  acknowledgedBy: z.string().cuid(),
});

export const acknowledgeAlertSchema = z.object({
  alertId: z.string().cuid(),
  reviewedBy: z.string().cuid(),
});

export const resolveAlertSchema = z.object({
  alertId: z.string().cuid(),
  reviewedBy: z.string().cuid(),
  resolution: z.string().min(1, "Resolution is required"),
});

// Signals - acknowledge only (system-generated, no manual creation)
export async function acknowledgeSignal(
  signalId: string,
  acknowledgedBy: string
) {
  const validated = acknowledgeSignalSchema.parse({ signalId, acknowledgedBy });

  return await prisma.decisionMonitoringSignal.update({
    where: { id: validated.signalId },
    data: {
      status: "ACKNOWLEDGED",
      acknowledgedBy: validated.acknowledgedBy,
      acknowledgedAt: new Date(),
    },
  });
}

// Alerts - acknowledge (human review required)
export async function acknowledgeAlert(
  alertId: string,
  reviewedBy: string
) {
  const validated = acknowledgeAlertSchema.parse({ alertId, reviewedBy });

  return await prisma.decisionRiskAlert.update({
    where: { id: validated.alertId },
    data: {
      status: "ACKNOWLEDGED",
      reviewedBy: validated.reviewedBy,
      reviewedAt: new Date(),
    },
  });
}

// Alerts - resolve (human review required, never auto-resolve)
export async function resolveAlert(
  alertId: string,
  reviewedBy: string,
  resolution: string
) {
  const validated = resolveAlertSchema.parse({ alertId, reviewedBy, resolution });

  return await prisma.decisionRiskAlert.update({
    where: { id: validated.alertId },
    data: {
      status: "RESOLVED",
      reviewedBy: validated.reviewedBy,
      reviewedAt: new Date(),
      resolution: validated.resolution,
    },
  });
}

// Query functions
export async function getSignalsByDecision(decisionId: string) {
  return await prisma.decisionMonitoringSignal.findMany({
    where: { decisionId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAlertsByDecision(decisionId: string) {
  return await prisma.decisionRiskAlert.findMany({
    where: { decisionId },
    include: { triggeringSignal: true },
    orderBy: { createdAt: "desc" },
  });
}
