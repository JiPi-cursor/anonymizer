import { FRENCH_NAME_SEQUENCE, FRENCH_TITLES } from "./constants";
import { FRENCH_PII_PATTERNS } from "./french-patterns";
import type { PatternDefinition, PiiType } from "./types";

/** Higher priority wins when two detections overlap. */
export const PII_PRIORITY: Record<PiiType, number> = {
  ssn: 100,
  iban: 99,
  identifier: 98,
  siret: 97,
  siren: 96,
  creditCard: 95,
  email: 90,
  phone: 80,
  url: 75,
  dateOfBirth: 70,
  date: 68,
  postalCode: 62,
  address: 60,
  organization: 55,
  location: 54,
  name: 50,
};

/** English / international patterns. */
const BASE_PII_PATTERNS: PatternDefinition[] = [
  {
    type: "url",
    regex: /\bhttps?:\/\/[^\s<>"']+/gd,
  },
  {
    type: "url",
    regex: /\bwww\.[A-Za-z0-9][-A-Za-z0-9]*(?:\.[A-Za-z0-9][-A-Za-z0-9]*)+\/[^\s<>"']*/gd,
  },
  {
    type: "date",
    regex:
      /\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\b/gd,
  },
  {
    type: "ssn",
    regex: /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/gd,
  },
  {
    type: "email",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gd,
  },
  {
    type: "phone",
    regex:
      /(?:\+?1[-.\s]?)?(?:\(\d{3}\)\s*|\d{3}[-.\s])\d{3}[-.\s]?\d{4}\b/gd,
  },
  {
    type: "phone",
    regex: /\b\d{3}[-.\s]\d{4}\b/gd,
  },
  {
    type: "dateOfBirth",
    regex:
      /\b(?:DOB|D\.O\.B\.|Date of Birth|Born(?: on)?)[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/gid,
    groupIndex: 1,
  },
  {
    type: "dateOfBirth",
    regex:
      /\b(?:DOB|Born)[:\s]+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/gid,
    groupIndex: 1,
  },
  {
    type: "address",
    regex: /\b(?:Address|Addr\.?)\s*:?\s*([^\n\r]+)/gid,
    groupIndex: 1,
  },
  {
    type: "address",
    regex:
      /\b\d{1,5}\s+(?:[A-Za-z0-9]+\s+){0,4}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl|Terrace)\b\.?/gid,
  },
  {
    type: "address",
    regex:
      /\b(?:Apt|Apartment|Suite|Ste|Unit|#)\s*\.?\s*[A-Za-z0-9-]+\b/gid,
  },
  {
    type: "name",
    regex:
      new RegExp(
        `\\b(?:Name|Patient|Client)\\s*:+\\s*(?:(?:${FRENCH_TITLES})\\s+)?(${FRENCH_NAME_SEQUENCE})\\b`,
        "gidu",
      ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex:
      new RegExp(
        `\\b(?:Mr|Mrs|Ms|Dr)\\.?\\s+(${FRENCH_NAME_SEQUENCE})\\b`,
        "gidu",
      ),
    groupIndex: 1,
  },
];

/**
 * All regex patterns for PII detection (international + French).
 * Uses the `d` flag so capture-group spans can be resolved precisely.
 */
export const PII_PATTERNS: PatternDefinition[] = [
  ...BASE_PII_PATTERNS,
  ...FRENCH_PII_PATTERNS,
];