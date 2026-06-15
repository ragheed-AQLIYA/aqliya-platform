// ─── Immutable Audit Trail Types ───
// أنواع سلسلة التدقيق غير القابلة للتعديل

export interface HashChainProof {
  entryId: string
  auditLogId: string
  previousHash: string | null
  chainHash: string
  nonce: number
  timestamp: Date
  action: string
  actorId: string
}

export interface ChainVerificationResult {
  verified: boolean
  totalEntries: number
  validEntries: number
  tamperedEntries: number
  firstTamperedId?: string
  details: Array<{
    entryId: string
    auditLogId: string
    position: number
    valid: boolean
    reason?: string
  }>
}

export interface ChainStatus {
  healthy: boolean
  totalEntries: number
  lastVerifiedAt: Date | null
  coverageStart: Date | null
  coverageEnd: Date | null
  tamperCount: number
}
