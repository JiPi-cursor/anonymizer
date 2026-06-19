import type { MappingEntry } from "@/lib/mapping";

/**
 * Supported PII categories.
 * Aligned with the Python Presidio perimeter in `others/Anonymizer_v2_1.py`.
 */
export type PiiType =
  | "name"
  | "organization"
  | "location"
  | "email"
  | "phone"
  | "postalCode"
  | "siret"
  | "siren"
  | "iban"
  | "url"
  | "date"
  | "dateOfBirth"
  | "identifier"
  | "ssn"
  | "creditCard"
  | "address";

/** A detected PII span within the source text. */
export interface PiiMatch {
  type: PiiType;
  start: number;
  end: number;
  text: string;
  /** Assigned anonymization tag, e.g. [PER_001]. */
  tag?: string;
}

/** Redaction counts grouped by PII type. */
export interface AnonymizeStats {
  total: number;
  byType: Record<PiiType, number>;
}

/** Full result of anonymizing a document. */
export interface AnonymizeResult {
  original: string;
  anonymized: string;
  matches: PiiMatch[];
  stats: AnonymizeStats;
  mapping: MappingEntry[];
}

/** Regex pattern with optional capture group for partial masking. */
export interface PatternDefinition {
  type: PiiType;
  regex: RegExp;
  /** Capture group index to mask; defaults to the full match. */
  groupIndex?: number;
  /** Optional post-match filter to reduce false positives. */
  validate?: (matchedText: string) => boolean;
}