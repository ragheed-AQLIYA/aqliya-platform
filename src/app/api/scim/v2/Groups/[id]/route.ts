// ─── SCIM /Groups/{id} Endpoint ───
// GET    /api/scim/v2/Groups/{id}  — get group by id
// PUT    /api/scim/v2/Groups/{id}  — full replace
// PATCH  /api/scim/v2/Groups/{id}  — partial update
// DELETE /api/scim/v2/Groups/{id}  — delete

import { NextResponse } from "next/server";
import type { ScimPatchRequest } from "@/lib/auth/scim-types";
import {
  buildScimError,
  SCIM_CONTENT_TYPE,
} from "@/lib/auth/scim-types";
import { getGroup, updateGroup, deleteGroup } from "@/lib/auth/scim-service";
import { authenticateScimRequest, getScimHeaders } from "../../auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = authenticateScimRequest(_request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const { id } = await params;
    const group = await getGroup(auth.organizationId!, id);
    if (!group) {
      return NextResponse.json(
        buildScimError(404, "Group not found"),
        { status: 404, headers: getScimHeaders() },
      );
    }

    return NextResponse.json(group, {
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

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = authenticateScimRequest(_request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const { id } = await params;
    const body: Record<string, unknown> = await _request.json();

    if (!body.schemas || !Array.isArray(body.schemas) || !body.schemas.includes("urn:ietf:params:scim:schemas:core:2.0:Group")) {
      return NextResponse.json(
        buildScimError(400, "schemas must include urn:ietf:params:scim:schemas:core:2.0:Group"),
        { status: 400, headers: getScimHeaders() },
      );
    }

    const updated = await updateGroup(auth.organizationId!, id, body);
    if (!updated) {
      return NextResponse.json(
        buildScimError(404, "Group not found"),
        { status: 404, headers: getScimHeaders() },
      );
    }

    return NextResponse.json(updated, {
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

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = authenticateScimRequest(_request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const { id } = await params;
    const body: ScimPatchRequest = await _request.json();

    if (!body.schemas || !body.Operations || !Array.isArray(body.Operations)) {
      return NextResponse.json(
        buildScimError(400, "Request must include schemas and Operations array"),
        { status: 400, headers: getScimHeaders() },
      );
    }

    // For groups, patch is treated as a full replace with the merged values
    const merged: Record<string, unknown> = {};
    for (const op of body.Operations) {
      if (op.op === "replace" || op.op === "add") {
        if (op.path === "displayName") {
          merged.displayName = String(op.value);
        } else if (!op.path && typeof op.value === "object" && op.value !== null) {
          const val = op.value as Record<string, unknown>;
          if (val.displayName) merged.displayName = String(val.displayName);
          if (val.members) merged.members = val.members;
        }
      }
    }

    if (merged.displayName) {
      const updated = await updateGroup(auth.organizationId!, id, merged);
      if (!updated) {
        return NextResponse.json(
          buildScimError(404, "Group not found"),
          { status: 404, headers: getScimHeaders() },
        );
      }
      return NextResponse.json(updated, {
        headers: getScimHeaders(),
      });
    }

    // No meaningful update — return existing
    const existing = await getGroup(auth.organizationId!, id);
    if (!existing) {
      return NextResponse.json(
        buildScimError(404, "Group not found"),
        { status: 404, headers: getScimHeaders() },
      );
    }
    return NextResponse.json(existing, {
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = authenticateScimRequest(_request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const { id } = await params;
    const deleted = await deleteGroup(auth.organizationId!, id);
    if (!deleted) {
      return NextResponse.json(
        buildScimError(404, "Group not found"),
        { status: 404, headers: getScimHeaders() },
      );
    }

    return new NextResponse(null, {
      status: 204,
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
