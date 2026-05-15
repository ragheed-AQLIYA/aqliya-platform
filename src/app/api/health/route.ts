import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const timestamp = new Date().toISOString()
  const environment = process.env.NODE_ENV ?? "development"

  let dbStatus = "disconnected"
  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = "connected"
  } catch {
    dbStatus = "disconnected"
  }

  const healthy = dbStatus === "connected"

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp,
      environment,
      database: dbStatus,
    },
    { status: healthy ? 200 : 503 }
  )
}
