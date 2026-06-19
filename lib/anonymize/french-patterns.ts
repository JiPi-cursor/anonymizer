import {
  FRENCH_LABEL_SEP,
  FRENCH_MONTHS,
  FRENCH_STREET_PARTICLE,
  FRENCH_STREET_TYPES,
  isLikelyFrenchFullName,
  NAME_TOKEN,
} from "./constants";
import type { PatternDefinition } from "./types";

const LABEL = FRENCH_LABEL_SEP;

/** Street name body: words after the street type, optional postal code + city. */
const STREET_BODY =
  `[A-Za-zÀ-öø-ÿ][A-Za-zÀ-öø-ÿ0-9\\-]*(?:[ \\t]+[A-Za-zÀ-öø-ÿ0-9\\-]+){0,8}`;
const POSTAL_CITY =
  `(?:,[ \\t]+\\d{5}[ \\t]+[A-Za-zÀ-öø-ÿ][A-Za-zÀ-öø-ÿ\\-]+(?:[ \\t]+[A-Za-zÀ-öø-ÿ\\-]+){0,2})?`;

/**
 * Rule-based regex patterns tuned for French documents.
 * Ordered within each section: labeled → specific → general.
 */
export const FRENCH_PII_PATTERNS: PatternDefinition[] = [
  // --- Social security (NIR) ---
  {
    type: "ssn",
    regex: new RegExp(
      `\\b(?:NIR|Numéro\\s+de\\s+sécurité\\s+sociale|Numero\\s+de\\s+securite\\s+sociale|n°\\s*(?:de\\s+)?sécurité\\s+sociale|n°\\s*SS|n°\\s*sécu)${LABEL}([12][\\s.]?\\d{2}(?:[\\s.]?\\d{2}){2}[\\s.]?\\d{3}[\\s.]?\\d{3}[\\s.]?\\d{2})\\b`,
      "gid",
    ),
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
    regex: new RegExp(
      `\\b(?:IBAN|RIB)${LABEL}((?:FR\\d{2}(?:\\s?\\d{4}){5}\\s?\\d{3}|[A-Z]{2}\\d{2}(?:\\s?[A-Z0-9]{4}){2,7}\\s?[A-Z0-9]{1,4}))\\b`,
      "gid",
    ),
    groupIndex: 1,
  },
  {
    type: "iban",
    regex: /\bFR\d{2}(?:\s?\d{4}){5}\s?\d{3}\b/gd,
  },
  {
    type: "iban",
    regex: /\bFR\d{2}[A-Z0-9]{23}\b/gd,
  },
  {
    type: "iban",
    regex: /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}\b/gd,
  },

  // --- Credit card ---
  {
    type: "creditCard",
    regex: new RegExp(
      `\\b(?:Carte\\s+bancaire|N°\\s*de\\s*carte|Numéro\\s+de\\s+carte|Numero\\s+de\\s+carte|CB)${LABEL}((?:\\d{4}[ \\t]){3}\\d{4})\\b`,
      "gid",
    ),
    groupIndex: 1,
  },
  {
    type: "creditCard",
    regex: /\b(?:\d{4}[ \t]){3}\d{4}\b/gd,
  },

  // --- Phone ---
  {
    type: "phone",
    regex: new RegExp(
      `\\b(?:Tél(?:éphone)?|Tél\\.|Telephone|GSM|Mobile|Portable|Fax)${LABEL}((?:\\+33|0)[\\s.\\-]?[1-9](?:[\\s.\\-]?\\d{2}){4})\\b`,
      "gid",
    ),
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
    regex: new RegExp(
      `\\b(?:Date\\s+de\\s+naissance|DDN|N[ée]e?\\s+le|Naissance)${LABEL}(\\d{1,2}[\\/\\-\\.]\\d{1,2}[\\/\\-\\.]\\d{2,4})\\b`,
      "gid",
    ),
    groupIndex: 1,
  },
  {
    type: "dateOfBirth",
    regex: new RegExp(
      `\\b(?:Date\\s+de\\s+naissance|N[ée]e?\\s+le)${LABEL}(\\d{1,2}\\s+(?:${FRENCH_MONTHS})\\s+\\d{4})\\b`,
      "gid",
    ),
    groupIndex: 1,
  },

  // --- Address (labeled first, then full street+postal, then fragments) ---
  {
    type: "address",
    regex: new RegExp(
      `\\b(?:Adresse|Adr\\.?)${LABEL}([^\\n\\r]+)`,
      "gid",
    ),
    groupIndex: 1,
  },
  {
    type: "address",
    regex: new RegExp(
      `\\b\\d{1,4}[ \\t]+(?i:${FRENCH_STREET_TYPES})\\s+${FRENCH_STREET_PARTICLE}?${STREET_BODY}${POSTAL_CITY}`,
      "gid",
    ),
  },
  {
    type: "address",
    regex: new RegExp(
      `\\b\\d{1,4}[ \\t]+(?i:${FRENCH_STREET_TYPES})\\s+${FRENCH_STREET_PARTICLE}?${STREET_BODY}`,
      "gid",
    ),
  },
  {
    type: "address",
    regex:
      /\b\d{5}[ \t]+[A-ZÀ-ÖØ-Þ][A-Za-zÀ-öø-ÿ\-]+(?:[ \t]+[A-Za-zÀ-öø-ÿ\-]+){0,3}\b/gd,
  },

  // --- Email (French labels) ---
  {
    type: "email",
    regex: new RegExp(
      `\\b(?:E-?mail|Courriel|Mél|Mel)${LABEL}([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})\\b`,
      "gid",
    ),
    groupIndex: 1,
  },

  // --- Names (labeled, titles, relatives, chez, unlabeled) ---
  {
    type: "name",
    regex: new RegExp(
      `\\b(?:Nom(?:\\s+et\\s+prénom)?|Prénom|Prenom|Identité|Identite)${LABEL}(${NAME_TOKEN}(?:[ \\t]+(?:de\\s+|du\\s+|le\\s+)?${NAME_TOKEN}){0,3})\\b`,
      "gid",
    ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex: new RegExp(
      `\\b(?:M\\.|Mme|Mlle|Monsieur|Madame|Mademoiselle)\\s+(${NAME_TOKEN}(?:[ \\t]+${NAME_TOKEN}){0,3})\\b`,
      "gid",
    ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex: new RegExp(
      `\\b(?:sa |son |leur )?(?:sœur|soeur|frère|frere|mère|mere|père|pere|épouse|epouse|fille|fils|mari|femme|ami|amie)\\s+(${NAME_TOKEN}[ \\t]+${NAME_TOKEN})\\b`,
      "gid",
    ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex: new RegExp(
      `\\bchez\\s+(${NAME_TOKEN}[ \\t]+${NAME_TOKEN})\\b`,
      "gid",
    ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex: new RegExp(
      `\\b((${NAME_TOKEN})(?:[ \\t]+${NAME_TOKEN}){1,2})\\b`,
      "gd",
    ),
    validate: isLikelyFrenchFullName,
  },
];