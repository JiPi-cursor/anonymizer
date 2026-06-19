import { PII_PATTERNS } from "./patterns";
import type { PatternDefinition, PiiMatch } from "./types";

/**
 * Collect every regex match for a single pattern definition.
 */
function collectPatternMatches(
  text: string,
  definition: PatternDefinition,
): PiiMatch[] {
  const matches: PiiMatch[] = [];
  const regex = new RegExp(
    definition.regex.source,
    definition.regex.flags,
  );

  let match = regex.exec(text);
  while (match !== null) {
    const span = resolveSpan(match, definition.groupIndex);
    const matchedText = text.slice(span.start, span.end);

    if (matchedText.length > 0) {
      matches.push({
        type: definition.type,
        start: span.start,
        end: span.end,
        text: matchedText,
      });
    }

    if (match[0].length === 0) {
      regex.lastIndex += 1;
    }

    match = regex.exec(text);
  }

  return matches;
}

/**
 * Resolve the start/end offsets for a match, optionally using a capture group.
 */
function resolveSpan(
  match: RegExpExecArray,
  groupIndex?: number,
): { start: number; end: number } {
  if (groupIndex !== undefined && match.indices?.[groupIndex]) {
    const [start, end] = match.indices[groupIndex];
    return { start, end };
  }

  if (match.indices?.[0]) {
    const [start, end] = match.indices[0];
    return { start, end };
  }

  return {
    start: match.index,
    end: match.index + match[0].length,
  };
}

/**
 * Run all PII detectors against the input text.
 */
export function detectAllMatches(text: string): PiiMatch[] {
  return PII_PATTERNS.flatMap((definition) =>
    collectPatternMatches(text, definition),
  );
}