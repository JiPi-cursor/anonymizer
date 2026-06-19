/** Supported categories of personally identifiable information. */
export type PiiType =
  | "ssn"
  | "iban"
  | "creditCard"
  | "email"
  | "phone"
  | "dateOfBirth"
  | "address"
  | "name";

/** A detected PII span within the source text. */
export interface PiiMatch {
  type: PiiType;
  start: number;
  end: number;
  text: string;
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