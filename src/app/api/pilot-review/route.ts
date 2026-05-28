import { NextResponse } from "next/server";

const MAX_FIELD_LENGTH = 2000;
const MAX_BODY_BYTES = 50_000;

const REQUIRED_FIELDS = [
  "name",
  "email",
  "organization",
  "productInterest",
  "useCase",
  "dataType",
  "goal",
] as const;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function looksLikeEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

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

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Body must be a JSON object." },
        { status: 400 },
      );
    }

    const errors: string[] = [];

    for (const field of REQUIRED_FIELDS) {
      const val = body[field];
      if (!isNonEmptyString(val)) {
        errors.push(`Missing or empty required field: ${field}`);
      } else if (val.length > MAX_FIELD_LENGTH) {
        errors.push(`Field too long: ${field} (max ${MAX_FIELD_LENGTH} chars)`);
      }
    }

    if (
      body.email &&
      isNonEmptyString(body.email) &&
      !looksLikeEmail(body.email)
    ) {
      errors.push("Invalid email format.");
    }

    for (const key of Object.keys(body)) {
      const val = body[key];
      if (typeof val === "string" && val.length > MAX_FIELD_LENGTH) {
        errors.push(`Field too long: ${key} (max ${MAX_FIELD_LENGTH} chars)`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { ok: false, error: errors.join(" ") },
        { status: 400 },
      );
    }

    const payload = body as unknown as PilotReviewPayload;
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
      { ok: true, message: "Pilot review request received." },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
