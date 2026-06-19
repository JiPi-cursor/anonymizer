import type { MappingEntry } from "@/lib/mapping";
import { PII_PRIORITY } from "./patterns";
import { TagRegistry } from "./tags";
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
 * Assign sequential tags and replace detected spans in the source text.
 * Replacements run right-to-left so indices stay valid.
 */
export function applyTaggedMasks(
  text: string,
  matches: PiiMatch[],
): { anonymized: string; matches: PiiMatch[]; mapping: MappingEntry[] } {
  const registry = new TagRegistry();
  const taggedMatches = matches.map((match) => ({
    ...match,
    tag: registry.getTag(match.type, match.text),
  }));

  const mappingByTag = new Map<string, MappingEntry>();

  for (const match of taggedMatches) {
    if (match.tag !== undefined && !mappingByTag.has(match.tag)) {
      mappingByTag.set(match.tag, {
        tag: match.tag,
        type: match.type,
        original: match.text,
      });
    }
  }

  const mapping = [...mappingByTag.values()].sort((a, b) =>
    a.tag.localeCompare(b.tag),
  );

  const ordered = [...taggedMatches].sort((a, b) => b.start - a.start);
  let result = text;

  for (const match of ordered) {
    const token = match.tag ?? "";
    result = result.slice(0, match.start) + token + result.slice(match.end);
  }

  return {
    anonymized: result,
    matches: taggedMatches,
    mapping,
  };
}

/** Build redaction statistics from the final match list. */
export function buildStats(matches: PiiMatch[]): AnonymizeStats {
  const byType: AnonymizeStats["byType"] = {
    ssn: 0,
    iban: 0,
    creditCard: 0,
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