import type { ISchedulingService, ScheduledJob, ScheduleFrequency } from "../contracts/scheduling";
import type { KernelResult } from "../types";
import { randomUUID } from "crypto";
import { prisma } from "../prisma";
import type { Prisma } from "@prisma/client";

function computeNextRun(frequency: ScheduleFrequency, from: Date = new Date()): Date {
  const next = new Date(from);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    default:
      // once — no next run
      break;
  }
  return next;
}

export class SchedulingServiceWrapper implements ISchedulingService {
  private jobs = new Map<string, ScheduledJob>();

  async schedule(input: {
    organizationId: string;
    name: string;
    frequency: ScheduleFrequency;
    cronExpression?: string;
    payload: Record<string, unknown>;
    runAt?: Date;
  }): Promise<KernelResult<ScheduledJob>> {
    try {
      const id = randomUUID();
      const job: ScheduledJob = {
        id,
        organizationId: input.organizationId,
        name: input.name,
        frequency: input.frequency,
        cronExpression: input.cronExpression,
        payload: input.payload,
        lastRunAt: undefined,
        nextRunAt: input.runAt ?? computeNextRun(input.frequency),
        enabled: true,
        createdAt: new Date(),
      };

      this.jobs.set(id, job);

      // Persist to audit trail
      await prisma.platformAuditLog.create({
        data: {
          platformOrganizationId: input.organizationId,
          productKey: "scheduling",
          actorId: "system",
          actorName: "scheduling-service",
          action: "schedule.created",
          targetType: "ScheduledJob",
          targetId: id,
          metadata: {
            name: input.name,
            frequency: input.frequency,
            nextRunAt: job.nextRunAt.toISOString(),
          } as Prisma.InputJsonValue,
        },
      });

      return { success: true, data: job };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to schedule job",
      };
    }
  }

  async cancel(jobId: string): Promise<KernelResult<void>> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return { success: false, error: "Job not found" };
    }
    job.enabled = false;
    this.jobs.set(jobId, job);
    return { success: true };
  }

  async getJobs(organizationId: string): Promise<KernelResult<ScheduledJob[]>> {
    const jobs = Array.from(this.jobs.values()).filter(
      (j) => j.organizationId === organizationId,
    );
    return { success: true, data: jobs };
  }

  async getJob(jobId: string): Promise<KernelResult<ScheduledJob>> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return { success: false, error: "Job not found" };
    }
    return { success: true, data: job };
  }
}
