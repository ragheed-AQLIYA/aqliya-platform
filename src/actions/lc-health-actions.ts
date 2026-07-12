"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface HealthCheck {
  name: string;
  label: string;
  status: "healthy" | "degraded" | "unhealthy";
  message: string;
}

export async function getLcHealthChecks(): Promise<HealthCheck[]> {
  await getCurrentUser();

  try {
    const projectCount = await prisma.localContentProject.count();
    const workbookCount = await prisma.lcWorkbook.count();

    return [
      {
        name: "db",
        label: "قاعدة البيانات / Database",
        status: "healthy",
        message: `${projectCount} مشروع, ${workbookCount} كشاف`,
      },
      {
        name: "projects",
        label: "المشاريع / Projects",
        status: projectCount > 0 ? "healthy" : "degraded",
        message: `${projectCount} مشروع`,
      },
      {
        name: "workbooks",
        label: "الكشوف / Workbooks",
        status: workbookCount > 0 ? "healthy" : "degraded",
        message: `${workbookCount} كشاف`,
      },
    ];
  } catch {
    return [
      {
        name: "db",
        label: "قاعدة البيانات / Database",
        status: "unhealthy",
        message: "تعذر الاتصال / Connection failed",
      },
    ];
  }
}
