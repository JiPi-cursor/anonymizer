import { detectAllMatches } from "./detectors";
import { applyMasks, buildStats, resolveMatches } from "./masker";
import type { AnonymizeResult } from "./types";

/**
 * Detect and mask personally identifiable information in plain text.
 * Runs entirely in-memory with no external dependencies.
 */
export function anonymizeText(text: string): AnonymizeResult {
  const allMatches = detectAllMatches(text);
  const matches = resolveMatches(allMatches);
  const anonymized = applyMasks(text, matches);
  const stats = buildStats(matches);

  return {
    original: text,
    anonymized,
    matches,
    stats,
  };
}

export type { AnonymizeResult, AnonymizeStats, PiiMatch, PiiType } from "./types";
export { MASK_TOKENS } from "./patterns";