import { NextResponse } from "next/server";
import { createLogger } from "@/lib/observability/logger";
import type { NextRequest } from "next/server";


const logger = createLogger({ product: "platform", action: "middleware" });

function timingMiddleware(request: NextRequest) {
  const start = Date.now();
  const response = NextResponse.next();

  response.headers.set("X-Response-Time", `${Date.now() - start}ms`);

  const duration = Date.now() - start;
  if (duration > 5000) {
    logger.warn("[SLOW]${request.method} ${request.url} took ${duration}ms");
  }

  return response;
}
