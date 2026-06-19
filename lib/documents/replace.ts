import type { MappingEntry } from "@/lib/mapping";
import type { Replacement } from "./types";

/**
 * Build ordered replacements from a mapping.
 * Longest source values are applied first to avoid partial collisions.
 */
export function buildReplacements(
  mapping: MappingEntry[],
  mode: "anonymize" | "deanonymize",
): Replacement[] {
  const replacements = mapping.map((entry) =>
    mode === "anonymize"
      ? { from: entry.original, to: entry.tag }
      : { from: entry.tag, to: entry.original },
  );

  return replacements.sort(
    (a, b) => b.from.length - a.from.length || a.from.localeCompare(b.from),
  );
}

/** Apply replacements to a plain-text buffer. */
export function applyReplacements(text: string, replacements: Replacement[]): string {
  let result = text;

  for (const { from, to } of replacements) {
    if (result.includes(from)) {
      result = result.replaceAll(from, to);
    }
  }

  return result;
}