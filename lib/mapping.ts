import { TAG_PREFIXES } from "@/lib/anonymize/tags";
import type { PiiType } from "@/lib/anonymize/types";

export const MAPPING_VERSION = 1;

/** Single tag ↔ original value correspondence. */
export interface MappingEntry {
  tag: string;
  type: PiiType;
  original: string;
}

/** JSON mapping file used to restore anonymized documents. */
export interface MappingFile {
  version: number;
  createdAt: string;
  sourceFile?: string;
  entries: MappingEntry[];
}

/** Fast lookup table built from mapping entries. */
export interface MappingLookup {
  byTag: Record<string, string>;
  entries: MappingEntry[];
}

/**
 * Build a mapping file from anonymization tag assignments.
 */
export function createMappingFile(
  entries: MappingEntry[],
  sourceFile?: string,
): MappingFile {
  return {
    version: MAPPING_VERSION,
    createdAt: new Date().toISOString(),
    sourceFile,
    entries,
  };
}

/**
 * Parse and validate a mapping JSON file loaded by the user.
 */
export function parseMappingFile(raw: string): MappingFile {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON mapping file.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Mapping file must be a JSON object.");
  }

  const record = parsed as Record<string, unknown>;

  if (!Array.isArray(record.entries)) {
    throw new Error('Mapping file must contain an "entries" array.');
  }

  const entries: MappingEntry[] = [];

  for (const item of record.entries) {
    if (typeof item !== "object" || item === null) {
      throw new Error("Each mapping entry must be an object.");
    }

    const entry = item as Record<string, unknown>;

    if (typeof entry.tag !== "string" || entry.tag.length === 0) {
      throw new Error("Each mapping entry requires a non-empty tag.");
    }

    if (typeof entry.original !== "string") {
      throw new Error("Each mapping entry requires an original value.");
    }

    if (typeof entry.type !== "string" || !(entry.type in TAG_PREFIXES)) {
      throw new Error("Each mapping entry requires a valid PII type.");
    }

    entries.push({
      tag: entry.tag,
      type: entry.type as PiiType,
      original: entry.original,
    });
  }

  return {
    version: typeof record.version === "number" ? record.version : MAPPING_VERSION,
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : new Date().toISOString(),
    sourceFile:
      typeof record.sourceFile === "string" ? record.sourceFile : undefined,
    entries,
  };
}

/** Build a tag → original lookup, longest tags first for safe replacement. */
export function buildMappingLookup(mapping: MappingFile): MappingLookup {
  const byTag: Record<string, string> = {};

  for (const entry of mapping.entries) {
    byTag[entry.tag] = entry.original;
  }

  return { byTag, entries: mapping.entries };
}

/**
 * Restore original values in anonymized text using a mapping file.
 * Replaces longer tags first to avoid partial collisions.
 */
export function deanonymizeText(text: string, mapping: MappingFile): string {
  const { byTag } = buildMappingLookup(mapping);
  const tags = Object.keys(byTag).sort((a, b) => b.length - a.length);

  let result = text;

  for (const tag of tags) {
    result = result.split(tag).join(byTag[tag]);
  }

  return result;
}

/** Serialize a mapping file to formatted JSON. */
export function serializeMappingFile(mapping: MappingFile): string {
  return JSON.stringify(mapping, null, 2);
}