import { NextResponse } from "next/server"

/** Kubernetes liveness — process up only (no DB). */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      probe: "live",
      uptime: Math.floor(process.uptime()),
    },
    { status: 200 },
  )
}
