import { cleanMappingEntries, createMappingFile } from "@/lib/mapping";
import { detectAllMatches } from "./detectors";
import { applyTaggedMasks, buildStats, resolveMatches } from "./masker";
import { normalizeText } from "./normalize";
import type { AnonymizeResult } from "./types";

/**
 * Detect and mask personally identifiable information in plain text.
 * Runs entirely in-memory with no external dependencies.
 */
export function anonymizeText(text: string, sourceFile?: string): AnonymizeResult {
  const normalized = normalizeText(text);
  const allMatches = detectAllMatches(normalized);
  const resolved = resolveMatches(allMatches);
  const { anonymized, matches, mapping } = applyTaggedMasks(normalized, resolved);
  const stats = buildStats(matches);

  return {
    original: normalized,
    anonymized,
    matches,
    stats,
    mapping: cleanMappingEntries(createMappingFile(mapping, sourceFile).entries),
  };
}

export { TAG_PREFIXES, formatTag } from "./tags";
export type { AnonymizeResult, AnonymizeStats, PiiMatch, PiiType } from "./types";