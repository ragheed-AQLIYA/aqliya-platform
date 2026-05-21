import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok" };
  } catch {
    checks.database = {
      status: "error",
      message: "Database connection failed",
    };
  }

  const allOk = Object.values(checks).every(
    (c) => (c as { status: string }).status === "ok",
  );

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}
