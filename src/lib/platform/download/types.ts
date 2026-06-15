// ─── أنواع بوابة التحميل الآمن — Secure Download Gate Types ───

export interface DownloadTicketInput {
  resourceType: string
  resourceId: string
  fileName: string
  mimeType: string
  fileSize?: number
  filePath?: string
  storageKey?: string
  workspaceId?: string
  expiresInMinutes?: number
  permissionCheck?: string
}

export interface DownloadGateResult {
  allowed: boolean
  reason?: string
  ticket?: DownloadTicketData
}

export interface DownloadTicketData {
  id: string
  token: string
  resourceType: string
  resourceId: string
  fileName: string
  mimeType: string
  fileSize?: number
  expiresAt: Date
  consumedAt?: Date
  revokedAt?: Date
}

export interface SecureDownloadHandlerInput {
  ticket: DownloadTicketData
  content: Buffer | Uint8Array | string
}

export type DownloadEventType =
  | "ticket.created"
  | "ticket.consumed"
  | "ticket.revoked"
  | "ticket.expired"
  | "download.completed"
  | "download.denied"
