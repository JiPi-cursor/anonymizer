import {
  FRENCH_MONTHS,
  FRENCH_STREET_TYPES,
  isLikelyFrenchFullName,
  NAME_TOKEN,
} from "./constants";
import type { PatternDefinition } from "./types";

/**
 * Rule-based regex patterns tuned for French documents.
 */
export const FRENCH_PII_PATTERNS: PatternDefinition[] = [
  // --- Social security (NIR) ---
  {
    type: "ssn",
    regex:
      /\b(?:NIR|N°\s*(?:de\s+)?sécurité\s+sociale|Numéro\s+(?:de\s+)?sécurité\s+sociale|n°\s*SS|n°\s*sécu)\s*:+\s*([12][\s.]?\d{2}(?:[\s.]?\d{2}){2}[\s.]?\d{3}[\s.]?\d{3}[\s.]?\d{2})\b/gid,
    groupIndex: 1,
  },
  {
    type: "ssn",
    regex: /\b[12][\s.]?\d{2}(?:[\s.]?\d{2}){2}[\s.]?\d{3}[\s.]?\d{3}[\s.]?\d{2}\b/gd,
  },
  {
    type: "ssn",
    regex: /\b[12]\d{13}\b/gd,
  },

  // --- IBAN ---
  {
    type: "iban",
    regex:
      /\b(?:IBAN|RIB)\s*:+\s*((?:FR\d{2}(?:\s?\d{4}){5}\s?\d{3}|[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){2,7}\s?[A-Z0-9]{1,4}))\b/gid,
    groupIndex: 1,
  },
  {
    type: "iban",
    regex: /\bFR\d{2}(?:\s?\d{4}){5}\s?\d{3}\b/gd,
  },
  {
    type: "iban",
    regex: /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}\b/gd,
  },

  // --- Phone ---
  {
    type: "phone",
    regex:
      /\b(?:Tél(?:éphone)?|Tél\.|GSM|Mobile|Portable|Fax)\s*:+\s*((?:\+33|0)[\s.\-]?[1-9](?:[\s.\-]?\d{2}){4})\b/gid,
    groupIndex: 1,
  },
  {
    type: "phone",
    regex: /\+33[\s.\-]?[1-9](?:[\s.\-]?\d{2}){4}\b/gd,
  },
  {
    type: "phone",
    regex: /\b0[1-9](?:[\s.\-]?\d{2}){4}\b/gd,
  },

  // --- Date of birth ---
  {
    type: "dateOfBirth",
    regex:
      /\b(?:Date de naissance|DDN|Né\(e\)?\s+le|Née?\s+le|Naissance)\s*:+\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/gid,
    groupIndex: 1,
  },
  {
    type: "dateOfBirth",
    regex:
      new RegExp(
        `\\b(?:Date de naissance|Né\\(e\\)?\\s+le|Née?\\s+le)\\s*:+\\s*(\\d{1,2}\\s+(?:${FRENCH_MONTHS})\\s+\\d{4})\\b`,
        "gid",
      ),
    groupIndex: 1,
  },

  // --- Address ---
  {
    type: "address",
    regex: /\b(?:Adresse|Adr\.?)\s*:\s*([^\n\r]+)/gid,
    groupIndex: 1,
  },
  {
    type: "address",
    regex:
      new RegExp(
        `\\b\\d{1,4}\\s*,?\\s*(?:${FRENCH_STREET_TYPES})\\s+(?:de\\s+la\\s+|de\\s+l['']|du\\s+|des\\s+d['']?|d['']?)?[A-Za-zÀ-öø-ÿ0-9\\-]+(?:[ \\t]+[A-Za-zÀ-öø-ÿ0-9\\-]+){0,6}`,
        "gid",
      ),
  },
  {
    type: "address",
    regex:
      /\b\d{5}[ \t]+[A-ZÀ-ÖØ-Þ][A-Za-zÀ-öø-ÿ\-]+(?:[ \t]+[A-Za-zÀ-öø-ÿ\-]+){0,3}\b/gd,
  },

  // --- Names ---
  {
    type: "name",
    regex:
      new RegExp(
        `\\b(?:Nom(?:\\s+et\\s+prénom)?|Prénom|Identité)\\s*:+\\s*(${NAME_TOKEN}(?:[ \\t]+(?:de\\s+|du\\s+|le\\s+)?${NAME_TOKEN}){0,3})\\b`,
        "gd",
      ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex:
      new RegExp(
        `\\b(?:M\\.|Mme|Mlle|Monsieur|Madame|Mademoiselle)\\s+(${NAME_TOKEN}(?:[ \\t]+${NAME_TOKEN}){0,3})\\b`,
        "gd",
      ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex: new RegExp(
      `\\b(${NAME_TOKEN}[ \\t]+${NAME_TOKEN})\\b`,
      "gd",
    ),
    validate: isLikelyFrenchFullName,
  },
];