// ─── AuditOS AI Assistance Service ───
// For the prototype, returns pre-defined AI suggestions.
// In production, calls an LLM through the AI Assistance Layer governance wrapper.

import type { AIAssistanceOutput, AccountMapping, TrialBalanceLine, FinancialStatementLine } from "@/types/audit"
import { mockAiOutputs } from "./mock-data"

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

interface AiSuggestionResult {
  suggestion: AIAssistanceOutput
  humanActionRequired: boolean
  governanceMetadata: {
    aiContributions: boolean
    modelVersion: string
    requiresConfirmation: boolean
    evidenceTraceAvailable: boolean
  }
}

export class AIService {
  // ─── Suggest Account Mapping ───
  static async suggestMapping(accountCode: string, accountName: string, balance: number): Promise<AiSuggestionResult> {
    await delay(400)
    const suggestion = mockAiOutputs.find(a => a.suggestionType === 'mapping')!
    return {
      suggestion: { ...suggestion, id: `ai-mapping-${Date.now()}`, inputContext: `Account: ${accountCode} - ${accountName}, balance SAR ${balance}`, createdAt: new Date().toISOString() },
      humanActionRequired: true,
      governanceMetadata: { aiContributions: true, modelVersion: 'audit-os-llm-v1', requiresConfirmation: true, evidenceTraceAvailable: true },
    }
  }

  // ─── Generate Signals from Trial Balance ───
  static async generateSignals(trialBalanceId: string): Promise<AiSuggestionResult[]> {
    await delay(800)
    return mockAiOutputs
      .filter(a => a.suggestionType === 'finding')
      .map(s => ({
        suggestion: s,
        humanActionRequired: true,
        governanceMetadata: { aiContributions: true, modelVersion: 'audit-os-llm-v1', requiresConfirmation: true, evidenceTraceAvailable: true },
      }))
  }

  // ─── Draft Finding Language ───
  static async draftFinding(accountContext: string, evidenceRefs: string[]): Promise<AiSuggestionResult> {
    await delay(500)
    const suggestion = mockAiOutputs.find(a => a.suggestionType === 'finding')!
    return {
      suggestion: { ...suggestion, id: `ai-finding-${Date.now()}`, inputContext: accountContext, createdAt: new Date().toISOString() },
      humanActionRequired: true,
      governanceMetadata: { aiContributions: true, modelVersion: 'audit-os-llm-v1', requiresConfirmation: true, evidenceTraceAvailable: true },
    }
  }

  // ─── Draft Recommendation ───
  static async draftRecommendation(findingId: string, findingDescription: string): Promise<AiSuggestionResult> {
    await delay(500)
    const suggestion = mockAiOutputs.find(a => a.suggestionType === 'recommendation')!
    return {
      suggestion: { ...suggestion, id: `ai-rec-${Date.now()}`, inputContext: findingDescription, createdAt: new Date().toISOString() },
      humanActionRequired: true,
      governanceMetadata: { aiContributions: true, modelVersion: 'audit-os-llm-v1', requiresConfirmation: true, evidenceTraceAvailable: true },
    }
  }

  // ─── Draft Disclosure Note ───
  static async draftNote(noteTitle: string, statementLine?: string): Promise<AiSuggestionResult> {
    await delay(400)
    const suggestion = mockAiOutputs.find(a => a.suggestionType === 'note_draft')!
    return {
      suggestion: { ...suggestion, id: `ai-note-${Date.now()}`, inputContext: `Note: ${noteTitle}`, createdAt: new Date().toISOString() },
      humanActionRequired: true,
      governanceMetadata: { aiContributions: true, modelVersion: 'audit-os-llm-v1', requiresConfirmation: true, evidenceTraceAvailable: false },
    }
  }

  // ─── Summarize Evidence ───
  static async summarizeEvidence(evidenceId: string, filename: string): Promise<AiSuggestionResult> {
    await delay(300)
    const suggestion = {
      id: `ai-summary-${Date.now()}`, engagementId: '', suggestionType: 'evidence_summary' as const,
      inputContext: `Evidence: ${filename}`, outputContent: `Summary of ${filename}: This document contains supporting evidence for the related account balance. Key details include transaction references, dates, and amounts that corroborate the recorded figures.`,
      confidence: 0.85, modelVersion: 'audit-os-llm-v1', status: 'suggested' as const, createdAt: new Date().toISOString(),
    }
    return { suggestion, humanActionRequired: false, governanceMetadata: { aiContributions: true, modelVersion: 'audit-os-llm-v1', requiresConfirmation: false, evidenceTraceAvailable: true } }
  }

  // ─── Explain Anomaly ───
  static async explainAnomaly(checkType: string, description: string): Promise<AiSuggestionResult> {
    await delay(400)
    const suggestion = mockAiOutputs.find(a => a.suggestionType === 'anomaly_explanation')!
    return {
      suggestion: { ...suggestion, id: `ai-anomaly-${Date.now()}`, inputContext: description, createdAt: new Date().toISOString() },
      humanActionRequired: false,
      governanceMetadata: { aiContributions: true, modelVersion: 'audit-os-llm-v1', requiresConfirmation: false, evidenceTraceAvailable: true },
    }
  }

  // ─── Rank Review Queue ───
  static async rankQueue(items: { id: string; riskLevel: string; materiality: string; deadline?: string }[]) {
    await delay(200)
    return items.sort((a, b) => {
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const aRisk = riskOrder[a.riskLevel as keyof typeof riskOrder] ?? 99
      const bRisk = riskOrder[b.riskLevel as keyof typeof riskOrder] ?? 99
      return aRisk - bRisk
    })
  }
}
