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

  let searchFrom = 0;

  while (searchFrom <= text.length) {
    regex.lastIndex = searchFrom;
    const match = regex.exec(text);

    if (match === null) {
      break;
    }

    const span = resolveSpan(match, definition.groupIndex);
    const matchedText = text.slice(span.start, span.end);
    const isValid =
      matchedText.length > 0 &&
      (definition.validate === undefined || definition.validate(matchedText));

    if (isValid) {
      matches.push({
        type: definition.type,
        start: span.start,
        end: span.end,
        text: matchedText,
      });
      searchFrom =
        match[0].length === 0 ? match.index + 1 : match.index + match[0].length;
      continue;
    }

    searchFrom = match.index + 1;
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
    if (start !== undefined && end !== undefined) {
      return { start, end };
    }
  }

  if (
    groupIndex !== undefined &&
    match[groupIndex] !== undefined &&
    match.index !== undefined
  ) {
    const groupText = match[groupIndex];
    const offset = match[0].indexOf(groupText);
    if (offset >= 0) {
      return {
        start: match.index + offset,
        end: match.index + offset + groupText.length,
      };
    }
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