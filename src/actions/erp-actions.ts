"use server";

import { revalidatePath } from "next/cache";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import * as erp from "@/lib/local-content/erp/services";

const PRODUCT_KEY = "local-content-os";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "صلاحية مرفوضة", code: "FORBIDDEN" };
    }
    const message = error instanceof Error ? error.message : "خطأ غير معروف";
    console.error("[ErpActions]", message);
    return { ok: false, error: message };
  }
}

async function getUserOrg() {
  const user = await requireUserContext("OPERATOR");
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    organizationId: user.organizationId,
  };
}

// ─── Connection CRUD ───

export async function listErpConnectionsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof erp.listErpConnections>>>
> {
  return safe(async () => {
    const { organizationId } = await requireUserContext("VIEWER");
    return erp.listErpConnections(organizationId);
  });
}

export async function getErpConnectionAction(
  connectionId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof erp.getErpConnection>>>> {
  return safe(async () => {
    const { organizationId } = await requireUserContext("VIEWER");
    return erp.getErpConnection(connectionId, organizationId);
  });
}

export async function createErpConnectionAction(
  data: {
    provider: string;
    label: string;
    connectionType?: string;
    apiEndpoint?: string;
    apiKey?: string;
    apiSecret?: string;
    sftpHost?: string;
    sftpPort?: number;
    sftpUsername?: string;
    sftpKey?: string;
    defaultCurrency?: string;
    syncIntervalMin?: number;
    sourceSystem?: string;
    fieldMapping?: Record<string, string>;
  },
): Promise<ActionResult<Awaited<ReturnType<typeof erp.createErpConnection>>>> {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    const conn = await erp.createErpConnection({
      organizationId: user.organizationId,
      ...data,
      actorId: user.id,
      actorName: user.name,
    });
    revalidateErpPaths();
    return conn;
  });
}

export async function updateErpConnectionAction(
  connectionId: string,
  data: {
    label?: string;
    apiEndpoint?: string;
    apiKey?: string;
    apiSecret?: string;
    syncEnabled?: boolean;
    syncIntervalMin?: number;
    defaultCurrency?: string;
    sftpHost?: string;
    sftpPort?: number;
    sftpUsername?: string;
    sftpKey?: string;
    sourceSystem?: string;
    fieldMapping?: Record<string, string>;
  },
): Promise<ActionResult<Awaited<ReturnType<typeof erp.updateErpConnection>>>> {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    const conn = await erp.updateErpConnection(connectionId, user.organizationId, {
      ...data,
      actorId: user.id,
      actorName: user.name,
    });
    revalidateErpPaths();
    return conn;
  });
}

export async function deleteErpConnectionAction(
  connectionId: string,
): Promise<ActionResult<void>> {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    await erp.deleteErpConnection(connectionId, user.organizationId, {
      id: user.id,
      name: user.name,
    });
    revalidateErpPaths();
  });
}

export async function testErpConnectionAction(
  connectionId: string,
): Promise<ActionResult<{ success: boolean; message: string }>> {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const result = await erp.testErpConnection(connectionId, user.organizationId, {
      id: user.id,
      name: user.name,
    });
    return result;
  });
}

export async function toggleSyncAction(
  connectionId: string,
  enabled: boolean,
): Promise<ActionResult<Awaited<ReturnType<typeof erp.toggleSync>>>> {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    const result = await erp.toggleSync(connectionId, user.organizationId, enabled, {
      id: user.id,
      name: user.name,
    });
    revalidateErpPaths();
    return result;
  });
}

export async function triggerImportAction(
  connectionId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof erp.triggerImport>>>> {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    const result = await erp.triggerImport(connectionId, user.organizationId, {
      id: user.id,
      name: user.name,
    });
    revalidateErpPaths();
    return result;
  });
}

// ─── Import Batches ───

export async function listImportBatchesAction(
  connectionId: string,
  status?: string,
): Promise<
  ActionResult<Awaited<ReturnType<typeof erp.listImportBatches>>>
> {
  return safe(async () => {
    const { organizationId } = await requireUserContext("VIEWER");
    return erp.listImportBatches(connectionId, organizationId, status);
  });
}

export async function getImportBatchAction(
  batchId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof erp.getImportBatch>>>> {
  return safe(async () => {
    const { organizationId } = await requireUserContext("VIEWER");
    return erp.getImportBatch(batchId, organizationId);
  });
}

export async function approveImportBatchAction(
  batchId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof erp.approveImportBatch>>>> {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    const result = await erp.approveImportBatch(batchId, user.organizationId, {
      id: user.id,
      name: user.name,
    });
    revalidateErpPaths();
    return result;
  });
}

export async function rejectImportBatchAction(
  batchId: string,
  reason?: string,
): Promise<ActionResult<Awaited<ReturnType<typeof erp.rejectImportBatch>>>> {
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    const result = await erp.rejectImportBatch(batchId, user.organizationId, {
      id: user.id,
      name: user.name,
    }, reason);
    revalidateErpPaths();
    return result;
  });
}

// ─── Sync Logs ───

export async function listSyncLogsAction(
  connectionId: string,
  limit = 20,
): Promise<ActionResult<Awaited<ReturnType<typeof erp.listSyncLogs>>>> {
  return safe(async () => {
    const { organizationId } = await requireUserContext("VIEWER");
    return erp.listSyncLogs(connectionId, organizationId, limit);
  });
}

// ─── Revalidation ───

function revalidateErpPaths() {
  revalidatePath("/local-content/settings/integrations");
}
