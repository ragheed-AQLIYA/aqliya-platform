// ─── SCIM /Users/{id} Endpoint ───
// GET    /api/scim/v2/Users/{id}  — get user by id
// PUT    /api/scim/v2/Users/{id}  — full replace
// PATCH  /api/scim/v2/Users/{id}  — partial update
// DELETE /api/scim/v2/Users/{id}  — deactivate

import { NextResponse } from "next/server";
import type { ScimPatchRequest } from "@/lib/auth/scim-types";
import {
  buildScimError,
  SCIM_CONTENT_TYPE,
} from "@/lib/auth/scim-types";
import { getUser, updateUser, patchUser, deleteUser } from "@/lib/auth/scim-service";
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
    const user = await getUser(auth.organizationId!, id);
    if (!user) {
      return NextResponse.json(
        buildScimError(404, "User not found"),
        { status: 404, headers: getScimHeaders() },
      );
    }

    return NextResponse.json(user, {
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

    if (!body.schemas || !Array.isArray(body.schemas) || !body.schemas.includes("urn:ietf:params:scim:schemas:core:2.0:User")) {
      return NextResponse.json(
        buildScimError(400, "schemas must include urn:ietf:params:scim:schemas:core:2.0:User"),
        { status: 400, headers: getScimHeaders() },
      );
    }

    const updated = await updateUser(auth.organizationId!, id, body);
    if (!updated) {
      return NextResponse.json(
        buildScimError(404, "User not found"),
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

    const updated = await patchUser(auth.organizationId!, id, {
      Operations: body.Operations as Array<{ op: string; path?: string; value: unknown }>,
    });

    if (!updated) {
      return NextResponse.json(
        buildScimError(404, "User not found"),
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
    const deleted = await deleteUser(auth.organizationId!, id);
    if (!deleted) {
      return NextResponse.json(
        buildScimError(404, "User not found"),
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
