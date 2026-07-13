import type { ISchedulingService, ScheduledJob, ScheduleFrequency } from "../contracts/scheduling";
import type { KernelResult } from "../types";
import { randomUUID } from "crypto";

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
    const job: ScheduledJob = {
      id: randomUUID(),
      organizationId: input.organizationId,
      name: input.name,
      frequency: input.frequency,
      cronExpression: input.cronExpression,
      payload: input.payload,
      nextRunAt: input.runAt ?? new Date(),
      enabled: true,
      createdAt: new Date(),
    };
    this.jobs.set(job.id, job);
    return { success: true, data: job };
  }

  async cancel(jobId: string): Promise<KernelResult<void>> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.enabled = false;
      this.jobs.set(jobId, job);
    }
    return { success: true };
  }

  async getJobs(organizationId: string): Promise<KernelResult<ScheduledJob[]>> {
    const jobs = Array.from(this.jobs.values()).filter((j) => j.organizationId === organizationId);
    return { success: true, data: jobs };
  }

  async getJob(jobId: string): Promise<KernelResult<ScheduledJob>> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return { success: false, error: "Job not found", code: "NOT_FOUND" };
    }
    return { success: true, data: job };
  }
}
