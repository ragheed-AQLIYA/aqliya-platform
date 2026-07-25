"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export type MonthlyTrend = {
  month: string;
  created: number;
  approved: number;
  rejected: number;
};

export async function getDecisionMonthlyTrends(): Promise<{
  success: boolean;
  data?: MonthlyTrend[];
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const decisions = await prisma.decision.findMany({
      where: {
        organizationId: user.organizationId,
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const monthMap = new Map<string, { created: number; approved: number; rejected: number }>();

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, { created: 0, approved: 0, rejected: 0 });
    }

    for (const d of decisions) {
      const key = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap.has(key)) {
        const entry = monthMap.get(key)!;
        entry.created++;
        if (d.status === "APPROVED") entry.approved++;
        if (d.status === "REJECTED") entry.rejected++;
      }
    }

    const data: MonthlyTrend[] = [];
    for (const [month, counts] of monthMap) {
      data.push({ month, ...counts });
    }

    return { success: true, data };
  } catch {
    return { success: false, error: "Failed to fetch monthly trends" };
  }
}
