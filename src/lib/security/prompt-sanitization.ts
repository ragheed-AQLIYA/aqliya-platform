// ─── AQLIYA Prompt Input Sanitizer ───
// Centralized defense against prompt injection attacks.
// Every LLM prompt path must call sanitizePromptInput() before sending
// user-controlled content to any LLM provider.
//
// This module provides:
// - sanitizePromptValue(): sanitize a single value for LLM prompt inclusion
// - sanitizePromptInput(): sanitize all string values in a record
// - sanitizeTaskInput(): sanitize only string values in a task input record, preserving types
// - sanitizeFreeText(): sanitize free-form text (instructions, queries, notes)

/**
 * Sanitize a single user-controlled value for safe inclusion in LLM prompts.
 * Handles strings, objects, numbers, booleans, null/undefined.
 */
export function sanitizePromptValue(value: unknown): string {
  if (value === null || value === undefined) return '(none)';
  let str = typeof value === 'string' ? value : JSON.stringify(value);

  // Hard limit — prevents context-window stuffing attacks
  if (str.length > 4000) str = str.slice(0, 4000) + '...(truncated)';

  str = str
    // Null bytes — can break parsers
    .replace(/\x00/g, '')
    // Markdown code fences — used to break out of user-context and inject system instructions
    .replace(/```/g, '\\`\\`\\`')
    // Section delimiters — the governance framework uses "=== SECTION ===" headers
    .replace(/===\s/g, '\\=\\=\\= ')
    // Attempted role/persona injection
    .replace(/^[\s]*(System|Assistant|User|Human|AI|ADMIN)\s*:/gim, (m) => m.replace(':', '\\:'))
    // XML/HTML tags that could be interpreted as tool-use markers
    .replace(/<\|[^>]+\|>/g, (m) => m.replace(/</g, '&lt;').replace(/>/g, '&gt;'));

  return str;
}

/**
 * Sanitize all values in a record, converting everything to strings.
 * Use when the consumer expects string values.
 */
export function sanitizePromptInput(
  input: Record<string, unknown>,
): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    sanitized[key] = sanitizePromptValue(value);
  }
  return sanitized;
}

/**
 * Sanitize only string values in a task input record, preserving non-string types.
 * This is the safe choice for the AI orchestrator where prompt builders
 * expect typed values (booleans, numbers, arrays) but string values
 * may contain user-controlled content.
 *
 * Unknown keys are passed through unchanged — only string values are sanitized.
 */
export function sanitizeTaskInput<T extends Record<string, unknown>>(
  input: T,
): T {
  const sanitized = { ...input };
  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizePromptValue(value);
    }
  }
  return sanitized;
}

/**
 * Sanitize a free-form text string for safe inclusion in an LLM prompt.
 * Use this for free-text fields like instructions, queries, notes, etc.
 */
export function sanitizeFreeText(text: string | undefined | null): string {
  if (!text) return '';
  let str = text;

  // Hard limit
  if (str.length > 4000) str = str.slice(0, 4000) + '...(truncated)';

  str = str
    .replace(/\x00/g, '')
    .replace(/```/g, '\\`\\`\\`')
    .replace(/===\s/g, '\\=\\=\\= ')
    .replace(/^[\s]*(System|Assistant|User|Human|AI|ADMIN)\s*:/gim, (m) => m.replace(':', '\\:'))
    .replace(/<\|[^>]+\|>/g, (m) => m.replace(/</g, '&lt;').replace(/>/g, '&gt;'));

  return str;
}
