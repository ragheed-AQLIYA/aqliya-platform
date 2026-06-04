// ─── SCIM /Groups Endpoint ───
// GET  /api/scim/v2/Groups      — list groups (paginated, filterable)
// POST /api/scim/v2/Groups      — create group

import { NextResponse } from "next/server";
import {
  buildScimListResponse,
  buildScimError,
  validateScimGroupPayload,
  SCIM_CONTENT_TYPE,
  type ScimGroup,
} from "@/lib/auth/scim-types";
import { listGroups, createGroup } from "@/lib/auth/scim-service";
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

    const result = await listGroups(auth.organizationId!, filter, startIndex, count);

    const response = buildScimListResponse<ScimGroup>(
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

    const validation = validateScimGroupPayload(body);
    if (!validation.valid) {
      return NextResponse.json(
        buildScimError(400, validation.errors.join("; ")),
        { status: 400, headers: getScimHeaders() },
      );
    }

    const group = await createGroup(auth.organizationId!, body);

    return NextResponse.json(group, {
      status: 201,
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
