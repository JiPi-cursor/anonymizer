import { TAG_PREFIXES } from "@/lib/anonymize/tags";
import { normalizeText } from "@/lib/anonymize/normalize";
import type { PiiType } from "@/lib/anonymize/types";

export const MAPPING_VERSION = 1;

const TYPE_SORT_ORDER: PiiType[] = [
  "name",
  "organization",
  "location",
  "phone",
  "email",
  "url",
  "address",
  "postalCode",
  "siret",
  "siren",
  "ssn",
  "iban",
  "creditCard",
  "dateOfBirth",
  "date",
  "identifier",
];

const TAG_PREFIXES_PATTERN = Object.values(TAG_PREFIXES).join("|");
const TAG_PATTERN = new RegExp(
  `^\\[(?:${TAG_PREFIXES_PATTERN})_\\d{3}\\]$`,
);

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
    entries: cleanMappingEntries(entries),
  };
}

/**
 * Remove duplicate tags and sort entries in a stable, human-readable order.
 */
export function cleanMappingEntries(entries: MappingEntry[]): MappingEntry[] {
  const unique = new Map<string, MappingEntry>();

  for (const entry of entries) {
    if (!unique.has(entry.tag)) {
      unique.set(entry.tag, entry);
    }
  }

  return [...unique.values()].sort(compareMappingEntries);
}

function compareMappingEntries(a: MappingEntry, b: MappingEntry): number {
  const typeDiff =
    TYPE_SORT_ORDER.indexOf(a.type) - TYPE_SORT_ORDER.indexOf(b.type);

  if (typeDiff !== 0) {
    return typeDiff;
  }

  return extractTagNumber(a.tag) - extractTagNumber(b.tag);
}

function extractTagNumber(tag: string): number {
  const match = tag.match(/_(\d{3})\]$/);
  return match ? Number.parseInt(match[1], 10) : 0;
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

    if (typeof entry.tag !== "string" || !TAG_PATTERN.test(entry.tag)) {
      throw new Error(`Invalid or missing tag: ${String(entry.tag)}`);
    }

    if (typeof entry.original !== "string" || entry.original.length === 0) {
      throw new Error(`Missing original value for tag ${entry.tag}.`);
    }

    if (typeof entry.type !== "string" || !(entry.type in TAG_PREFIXES)) {
      throw new Error(`Invalid PII type for tag ${entry.tag}.`);
    }

    entries.push({
      tag: entry.tag,
      type: entry.type as PiiType,
      original: entry.original,
    });
  }

  const cleaned = cleanMappingEntries(entries);

  if (cleaned.length !== entries.length) {
    throw new Error("Mapping file contains duplicate tags.");
  }

  return {
    version: typeof record.version === "number" ? record.version : MAPPING_VERSION,
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : new Date().toISOString(),
    sourceFile:
      typeof record.sourceFile === "string" ? record.sourceFile : undefined,
    entries: cleaned,
  };
}

/** Build a tag → original lookup table. */
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
  const normalized = normalizeText(text);
  const entries = [...mapping.entries].sort(
    (a, b) => b.tag.length - a.tag.length || compareMappingEntries(a, b),
  );

  let result = normalized;

  for (const { tag, original } of entries) {
    if (result.includes(tag)) {
      result = result.replaceAll(tag, original);
    }
  }

  return result;
}

/** Serialize a mapping file to formatted JSON. */
export function serializeMappingFile(mapping: MappingFile): string {
  return JSON.stringify(
    {
      ...mapping,
      entries: cleanMappingEntries(mapping.entries),
    },
    null,
    2,
  );
}