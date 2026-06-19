import { createMappingFile } from "@/lib/mapping";
import { detectAllMatches } from "./detectors";
import { applyTaggedMasks, buildStats, resolveMatches } from "./masker";
import type { AnonymizeResult } from "./types";

/**
 * Detect and mask personally identifiable information in plain text.
 * Runs entirely in-memory with no external dependencies.
 */
export function anonymizeText(text: string, sourceFile?: string): AnonymizeResult {
  const allMatches = detectAllMatches(text);
  const resolved = resolveMatches(allMatches);
  const { anonymized, matches, mapping } = applyTaggedMasks(text, resolved);
  const stats = buildStats(matches);

  return {
    original: text,
    anonymized,
    matches,
    stats,
    mapping: createMappingFile(mapping, sourceFile).entries,
  };
}

export { TAG_PREFIXES, formatTag } from "./tags";
export type { AnonymizeResult, AnonymizeStats, PiiMatch, PiiType } from "./types";