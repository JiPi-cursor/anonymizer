import { MASK_TOKENS, PII_PRIORITY } from "./patterns";
import type { AnonymizeStats, PiiMatch } from "./types";

/**
 * Select non-overlapping matches, preferring higher-priority and longer spans.
 */
export function resolveMatches(matches: PiiMatch[]): PiiMatch[] {
  const sorted = [...matches].sort((a, b) => {
    const priorityDiff = PII_PRIORITY[b.type] - PII_PRIORITY[a.type];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const lengthDiff = b.end - b.start - (a.end - a.start);
    if (lengthDiff !== 0) {
      return lengthDiff;
    }

    return a.start - b.start;
  });

  const selected: PiiMatch[] = [];

  for (const match of sorted) {
    const overlaps = selected.some(
      (existing) => match.start < existing.end && match.end > existing.start,
    );

    if (!overlaps) {
      selected.push(match);
    }
  }

  return selected.sort((a, b) => a.start - b.start);
}

/**
 * Replace detected spans with type-specific mask tokens.
 * Replacements run right-to-left so indices stay valid.
 */
export function applyMasks(text: string, matches: PiiMatch[]): string {
  const ordered = [...matches].sort((a, b) => b.start - a.start);
  let result = text;

  for (const match of ordered) {
    const token = MASK_TOKENS[match.type];
    result = result.slice(0, match.start) + token + result.slice(match.end);
  }

  return result;
}

/** Build redaction statistics from the final match list. */
export function buildStats(matches: PiiMatch[]): AnonymizeStats {
  const byType: AnonymizeStats["byType"] = {
    ssn: 0,
    iban: 0,
    email: 0,
    phone: 0,
    dateOfBirth: 0,
    address: 0,
    name: 0,
  };

  for (const match of matches) {
    byType[match.type] += 1;
  }

  return {
    total: matches.length,
    byType,
  };
}