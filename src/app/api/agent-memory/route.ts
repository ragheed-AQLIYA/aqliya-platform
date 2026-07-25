import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import {
  setAgentMemory,
  getAgentMemory,
  queryAgentMemory,
  deleteAgentMemory,
} from "@/lib/platform/agent-memory";

export const dynamic = "force-dynamic";

const agentMemoryPostSchema = z.object({
  agentId: z.string().min(1),
  memoryKey: z.string().min(1),
  memoryValue: z.unknown(),
  agentType: z.string().optional(),
  ttl: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "VIEWER")) {
      throw new Error("Access denied: VIEWER role required");
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId") ?? undefined;
    const agentType = searchParams.get("agentType") ?? undefined;
    const prefix = searchParams.get("prefix") ?? undefined;
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean) : undefined;

    if (searchParams.has("memoryKey") && agentId) {
      const memoryKey = searchParams.get("memoryKey")!;
      const value = await getAgentMemory(user.organizationId, agentId, memoryKey);
      return NextResponse.json({
        success: true,
        data: value,
        meta: { timestamp: new Date().toISOString() },
      });
    }

    const results = await queryAgentMemory(user.organizationId, {
      agentId,
      agentType,
      memoryKeyPrefix: prefix,
      tags,
    });

    return NextResponse.json({
      success: true,
      data: results,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthenticated") {
        return NextResponse.json(
          { success: false, error: { code: "UNAUTHENTICATED", message: "Authentication required" }, meta: { timestamp: new Date().toISOString() } },
          { status: 401 },
        );
      }
      if (error.message.startsWith("Access denied:")) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Access denied" }, meta: { timestamp: new Date().toISOString() } },
          { status: 403 },
        );
      }
    }
    return NextResponse.json(
      { success: false, error: { code: "AGENT_MEMORY_ERROR", message: "Failed to query agent memory" }, meta: { timestamp: new Date().toISOString() } },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "OPERATOR")) {
      throw new Error("Access denied: OPERATOR role required");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid JSON body" }, meta: { timestamp: new Date().toISOString() } },
        { status: 400 },
      );
    }

    const parsed = agentMemoryPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues.map((i) => i.message).join(" ") }, meta: { timestamp: new Date().toISOString() } },
        { status: 400 },
      );
    }

    const { agentId, memoryKey, memoryValue, agentType, ttl, tags } = parsed.data;

    await setAgentMemory(user.organizationId, {
      agentId,
      memoryKey,
      memoryValue,
      agentType,
      ttl: ttl ? new Date(ttl) : undefined,
      tags,
      createdById: user.id,
    });

    return NextResponse.json({
      success: true,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthenticated") {
        return NextResponse.json(
          { success: false, error: { code: "UNAUTHENTICATED", message: "Authentication required" }, meta: { timestamp: new Date().toISOString() } },
          { status: 401 },
        );
      }
      if (error.message.startsWith("Access denied:")) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Access denied" }, meta: { timestamp: new Date().toISOString() } },
          { status: 403 },
        );
      }
    }
    return NextResponse.json(
      { success: false, error: { code: "AGENT_MEMORY_ERROR", message: "Failed to store agent memory" }, meta: { timestamp: new Date().toISOString() } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "OPERATOR")) {
      throw new Error("Access denied: OPERATOR role required");
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const memoryKey = searchParams.get("memoryKey");

    if (!agentId || !memoryKey) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "agentId and memoryKey are required" }, meta: { timestamp: new Date().toISOString() } },
        { status: 400 },
      );
    }

    await deleteAgentMemory(user.organizationId, agentId, memoryKey);

    return NextResponse.json({
      success: true,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthenticated") {
        return NextResponse.json(
          { success: false, error: { code: "UNAUTHENTICATED", message: "Authentication required" }, meta: { timestamp: new Date().toISOString() } },
          { status: 401 },
        );
      }
      if (error.message.startsWith("Access denied:")) {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Access denied" }, meta: { timestamp: new Date().toISOString() } },
          { status: 403 },
        );
      }
    }
    return NextResponse.json(
      { success: false, error: { code: "AGENT_MEMORY_ERROR", message: "Failed to delete agent memory" }, meta: { timestamp: new Date().toISOString() } },
      { status: 500 },
    );
  }
}
