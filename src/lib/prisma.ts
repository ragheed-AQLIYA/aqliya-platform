import "server-only"
import { createLogger } from "@/lib/observability/logger";

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"


const logger = createLogger({ product: "platform", action: "unknown" });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// During Next.js build phase, DATABASE_URL is not available.
// Detect build time so PrismaClient initialization doesn't crash CI.
const isBuildPhase =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.npm_lifecycle_event === "build"

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    if (isBuildPhase) {
      // Build-time: return no-op client. Real client is initialized at runtime.
      logger.warn("[prisma]DATABASE_URL not set during build — returning no-op client")
      return {} as PrismaClient
    }
    throw new Error("DATABASE_URL is required to initialize PrismaClient")
  }

  const adapter = new PrismaPg(databaseUrl)

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
