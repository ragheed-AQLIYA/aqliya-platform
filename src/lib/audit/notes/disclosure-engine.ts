import type { DisclosureNote } from "@/types/audit";
import type { DisclosureTrigger } from "@/lib/audit/rules/types";
import type { SocpaDisclosureTrigger } from "@/lib/audit/rules/types";
import { formatRuleCitationMarker } from "./disclosure-types";
import type {
  RuleTriggeredDraftNote,
  UnifiedDisclosureTrigger,
} from "./disclosure-engine-types";

export function unifyIfrsTriggers(
  triggers: DisclosureTrigger[],
): UnifiedDisclosureTrigger[] {
  return triggers.map((t) => ({
    ruleId: t.ruleId,
    standardCode: t.standardCode,
    noteType: t.suggestedNoteType,
    noteTitle: t.suggestedTitle,
    noteTitleAr: t.suggestedTitle,
    reasonAr: t.reasonAr,
    reasonEn: t.reasonEn,
    source: "ifrs",
  }));
}

export function unifySocpaTriggers(
  triggers: SocpaDisclosureTrigger[],
): UnifiedDisclosureTrigger[] {
  return triggers.map((t) => ({
    ruleId: t.ruleId,
    standardCode: t.standardCode,
    noteType: t.suggestedNoteType,
    noteTitle: t.suggestedTitle,
    noteTitleAr: t.suggestedTitle,
    reasonAr: t.reasonAr,
    reasonEn: t.reasonEn,
    source: "socpa",
  }));
}

export function mergeTriggerLists(
  ...lists: UnifiedDisclosureTrigger[][]
): UnifiedDisclosureTrigger[] {
  return lists.flat();
}

export function dedupeUnifiedTriggers(
  triggers: UnifiedDisclosureTrigger[],
): UnifiedDisclosureTrigger[] {
  const seen = new Set<string>();
  const out: UnifiedDisclosureTrigger[] = [];

  for (const t of triggers) {
    const key = `${t.noteType}|${t.noteTitle.toLowerCase()}|${t.source}|${t.ruleId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }

  return out;
}

export function nextNoteNumber(existingNotes: DisclosureNote[]): string {
  const nums = existingNotes
    .map((n) => parseInt(n.noteNumber, 10))
    .filter((n) => Number.isFinite(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return String(max + 1);
}

export function shouldSkipExistingNote(status: string): boolean {
  return status === "reviewed" || status === "approved";
}

export function findMatchingNote(
  notes: DisclosureNote[],
  trigger: UnifiedDisclosureTrigger,
): DisclosureNote | undefined {
  return notes.find(
    (n) =>
      n.noteType === trigger.noteType &&
      n.title.trim().toLowerCase() === trigger.noteTitle.trim().toLowerCase(),
  );
}

export function buildDraftFromTrigger(
  trigger: UnifiedDisclosureTrigger,
): RuleTriggeredDraftNote {
  const marker = formatRuleCitationMarker({
    source: trigger.source,
    ruleId: trigger.ruleId,
    standardCode: trigger.standardCode,
  });

  const content = [
    `# ${trigger.noteTitle}`,
    "",
    "**Assistive draft — human review required**",
    "",
    trigger.reasonEn,
    "",
    trigger.reasonAr,
    "",
    `Rule reference: ${trigger.standardCode} · ${trigger.ruleId} (${trigger.source.toUpperCase()})`,
    "",
    "_AI assists. Humans decide. Evidence governs._",
  ].join("\n");

  return {
    noteNumber: "",
    title: trigger.noteTitle,
    noteType: trigger.noteType,
    content,
    missingInformation: [marker, "HUMAN_REVIEW_REQUIRED"],
    ruleCitations: [
      {
        ruleId: trigger.ruleId,
        standardCode: trigger.standardCode,
        source: trigger.source,
      },
    ],
  };
}

export function mergeMissingInformation(
  existing: string[],
  incoming: string[],
): string[] {
  return [...new Set([...existing, ...incoming])];
}
