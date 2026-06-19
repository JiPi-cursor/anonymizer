import type { PiiType } from "./types";

/** Clear, typed tag prefixes — one category per PII kind. */
export const TAG_PREFIXES: Record<PiiType, string> = {
  name: "PER",
  organization: "ORG",
  location: "LIEU",
  email: "EMAIL",
  phone: "TEL",
  postalCode: "CODE_POSTAL",
  siret: "SIRET",
  siren: "SIREN",
  iban: "IBAN",
  url: "URL",
  date: "DATE",
  dateOfBirth: "DOB",
  identifier: "IDENTIFIANT",
  ssn: "SSN",
  creditCard: "CARD",
  address: "ADDR",
};

/**
 * Format a tag string from a category prefix and sequence number.
 * @example formatTag("PER", 1) => "[PER_001]"
 */
export function formatTag(prefix: string, sequence: number): string {
  return `[${prefix}_${String(sequence).padStart(3, "0")}]`;
}

/**
 * Assigns stable sequential tags per PII type. Identical values reuse the same tag.
 */
export class TagRegistry {
  private readonly counters = new Map<string, number>();
  private readonly valueToTag = new Map<string, string>();

  /**
   * Returns an existing or newly created tag for a detected value.
   */
  getTag(type: PiiType, original: string): string {
    const cacheKey = `${type}\0${original}`;

    const existing = this.valueToTag.get(cacheKey);
    if (existing !== undefined) {
      return existing;
    }

    const prefix = TAG_PREFIXES[type];
    const next = (this.counters.get(prefix) ?? 0) + 1;
    this.counters.set(prefix, next);

    const tag = formatTag(prefix, next);
    this.valueToTag.set(cacheKey, tag);
    return tag;
  }
}