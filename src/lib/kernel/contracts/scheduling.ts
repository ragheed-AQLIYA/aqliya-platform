import type { KernelResult } from "../types";

export type ScheduleFrequency = "once" | "daily" | "weekly" | "monthly" | "quarterly";

export interface ScheduledJob {
  id: string;
  organizationId: string;
  name: string;
  frequency: ScheduleFrequency;
  cronExpression?: string;
  payload: Record<string, unknown>;
  lastRunAt?: Date;
  nextRunAt: Date;
  enabled: boolean;
  createdAt: Date;
}

export interface ISchedulingService {
  schedule(input: {
    organizationId: string;
    name: string;
    frequency: ScheduleFrequency;
    cronExpression?: string;
    payload: Record<string, unknown>;
    runAt?: Date;
  }): Promise<KernelResult<ScheduledJob>>;
  cancel(jobId: string): Promise<KernelResult<void>>;
  getJobs(organizationId: string): Promise<KernelResult<ScheduledJob[]>>;
  getJob(jobId: string): Promise<KernelResult<ScheduledJob>>;
}
