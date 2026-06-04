// ─── SCIM /Users Endpoint ───
// GET  /api/scim/v2/Users      — list users (paginated, filterable)
// POST /api/scim/v2/Users      — create user

import { NextResponse } from "next/server";
import {
  buildScimListResponse,
  buildScimError,
  validateScimUserPayload,
  SCIM_CONTENT_TYPE,
  type ScimUser,
} from "@/lib/auth/scim-types";
import { listUsers, createUser } from "@/lib/auth/scim-service";
import { authenticateScimRequest, getScimHeaders } from "../auth";

export async function GET(request: Request) {
  const auth = authenticateScimRequest(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter") || undefined;
    const startIndex = parseInt(url.searchParams.get("startIndex") || "1", 10);
    const count = parseInt(url.searchParams.get("count") || "100", 10);

    const result = await listUsers(auth.organizationId!, filter, startIndex, count);

    const response = buildScimListResponse<ScimUser>(
      result.Resources,
      result.totalResults,
      result.startIndex,
      result.itemsPerPage,
    );

    return NextResponse.json(response, {
      headers: getScimHeaders(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      buildScimError(500, message),
      { status: 500, headers: getScimHeaders() },
    );
  }
}

export async function POST(request: Request) {
  const auth = authenticateScimRequest(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const body: Record<string, unknown> = await request.json();

    const validation = validateScimUserPayload(body);
    if (!validation.valid) {
      return NextResponse.json(
        buildScimError(400, validation.errors.join("; ")),
        { status: 400, headers: getScimHeaders() },
      );
    }

    const result = await createUser(auth.organizationId!, body);

    return NextResponse.json(
      result.scimUser,
      {
        status: result.created ? 201 : 200,
        headers: getScimHeaders(),
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      buildScimError(500, message),
      { status: 500, headers: getScimHeaders() },
    );
  }
}
