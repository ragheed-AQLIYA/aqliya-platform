import { z } from "zod";
import { NextResponse } from "next/server";
import { checkRateLimit, clientIpRateLimitKey } from "@/lib/rate-limit";
import { verifyPow } from "@/lib/security/pow";

const MAX_BODY_BYTES = 50_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;

const pilotReviewSchema = z.object({
  name: z.string().min(1).max(2000),
  email: z.string().email(),
  organization: z.string().min(1).max(2000),
  useCase: z.string().min(1).max(2000),
  role: z.string().max(2000).optional(),
  productInterest: z.string().max(2000).optional(),
  interest: z.string().max(2000).optional(),
  dataType: z.string().max(2000).optional(),
  currentWorkflow: z.string().max(2000).optional(),
  goal: z.string().max(2000).optional(),
  pow: z.object({
    token: z.string(),
    nonce: z.string(),
    hash: z.string(),
  }),
});

type PilotReviewInput = z.infer<typeof pilotReviewSchema>;

const DEFAULTS = {
  productInterest: "غير متأكد — أحتاج توجيهًا",
  dataType: "غير محدد — سأناقشه مع الفريق",
  goal: "يُناقش في جلسة التشخيص",
} as const;

interface PilotReviewPayload {
  name: string;
  email: string;
  organization: string;
  role?: string;
  productInterest: string;
  interest?: string;
  useCase: string;
  dataType: string;
  currentWorkflow?: string;
  goal: string;
}

interface WebhookPayload {
  source: "pilot-review-form";
  submittedAt: string;
  environment: string;
  request: PilotReviewPayload;
  meta: {
    userAgent: string;
    referer: string;
  };
}

function buildWebhookPayload(
  request: Request,
  data: PilotReviewPayload,
): WebhookPayload {
  return {
    source: "pilot-review-form",
    submittedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "production",
    request: data,
    meta: {
      userAgent: request.headers.get("user-agent") ?? "",
      referer: request.headers.get("referer") ?? "",
    },
  };
}

function safeDevLog(data: PilotReviewPayload) {
  if (process.env.NODE_ENV !== "development") return;
  console.log(
    `[PilotReview] source=pilot-review-form | org=${data.organization} | product=${data.productInterest} | submittedAt=${new Date().toISOString()}`,
  );
}

export async function POST(request: Request) {
  try {
    const { allowed } = await checkRateLimit(
      clientIpRateLimitKey("pilot-review", request),
      {
        maxRequests: RATE_LIMIT_MAX,
        windowMs: RATE_LIMIT_WINDOW_MS,
      },
    );
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Payload too large." },
        { status: 413 },
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const parsed = pilotReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues.map((i) => i.message).join(" ") },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Verify proof-of-work
    const powResult = verifyPow(data.pow);
    if (!powResult.valid) {
      return NextResponse.json(
        { ok: false, error: `Verification failed: ${powResult.reason}` },
        { status: 403 },
      );
    }

    const payload: PilotReviewPayload = {
      name: data.name.trim(),
      email: data.email.trim(),
      organization: data.organization.trim(),
      useCase: data.useCase.trim(),
      role: data.role?.trim() || undefined,
      productInterest: data.productInterest?.trim() || DEFAULTS.productInterest,
      interest: data.interest?.trim() || undefined,
      dataType: data.dataType?.trim() || DEFAULTS.dataType,
      currentWorkflow: data.currentWorkflow?.trim() || undefined,
      goal: data.goal?.trim() || DEFAULTS.goal,
    };
    safeDevLog(payload);

    const webhookUrl = process.env.PILOT_REVIEW_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const webhookPayload = buildWebhookPayload(request, payload);
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookPayload),
          signal: AbortSignal.timeout(5000),
        });
      } catch {
        // fail silently — webhook is optional
      }
    }

    return NextResponse.json(
      { ok: true, message: "Evaluation request received." },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
