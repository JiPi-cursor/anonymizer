import {
  FRENCH_LABEL_SEP,
  FRENCH_MONTHS,
  FRENCH_NAME_SEQUENCE,
  FRENCH_STREET_PARTICLE,
  FRENCH_STREET_TYPES,
  FRENCH_TITLES,
  isLikelyFrenchFullName,
  NAME_TOKEN,
} from "./constants";
import type { PatternDefinition } from "./types";
import {
  isPlausibleSirenDigits,
  isPlausibleSiretDigits,
} from "./validators";

const LABEL = FRENCH_LABEL_SEP;
const UNICODE_FLAGS = "gdu";

/** Street name body: words after the street type, optional postal code + city. */
const STREET_BODY =
  "[\\p{L}][\\p{L}0-9\\-]*(?:[ \\t]+[\\p{L}0-9\\-]+){0,8}";
const POSTAL_CITY =
  "(?:,[ \\t]+\\d{5}[ \\t]+[\\p{Lu}\\p{Ll}\\-]+(?:[ \\t]+[\\p{L}\\-]+){0,2})?";
const STREET_NUMBER = "\\d{1,4}\\s*(?:bis|ter)?";

/**
 * Rule-based regex patterns tuned for French documents.
 * Ordered within each section: labeled → specific → general.
 */
const ORG_BODY = "[\\p{Lu}][\\p{L}0-9'’\\-&]+(?:[ \\t]+[\\p{L}0-9'’\\-&]+){0,6}";
const LOCATION_BODY =
  "[\\p{Lu}][\\p{L}\\-]+(?:[ \\t]+[\\p{L}\\-]+){0,4}";
const IDENTIFIER_BODY = "[A-Z0-9][A-Z0-9\\-_/]{2,}";
const SIRET_BODY = "\\d{3}\\s?\\d{3}\\s?\\d{3}\\s?\\d{5}";
const SIREN_BODY = "\\d{3}\\s?\\d{3}\\s?\\d{3}";

export const FRENCH_PII_PATTERNS: PatternDefinition[] = [
  // --- SIRET / SIREN (aligned with Python direct-regex pass) ---
  {
    type: "siret",
    regex: new RegExp(
      `\\b(?i:SIRET|RCS|n°\\s*RCS|immatriculation)(?:\\s+[^:]+)?${LABEL}(${SIRET_BODY}|\\d{14})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "siret",
    regex: new RegExp(
      `\\b(?i:SIRET)\\s+(${SIRET_BODY}|\\d{14})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "siret",
    regex: new RegExp(`\\(SIRET\\s+(${SIRET_BODY})\\)`, UNICODE_FLAGS),
    groupIndex: 1,
  },
  {
    type: "siren",
    regex: new RegExp(
      `\\b(?i:SIREN)(?:\\s+[^:]+)?${LABEL}(${SIREN_BODY}|\\d{9})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "siren",
    regex: new RegExp(
      `\\b(?i:SIREN)\\s+(${SIREN_BODY}|\\d{9})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "siret",
    regex: /\b\d{3}\s\d{3}\s\d{3}\s\d{5}\b/gd,
    validate: isPlausibleSiretDigits,
  },
  {
    type: "siret",
    regex: /\b\d{14}\b/gd,
    validate: isPlausibleSiretDigits,
  },
  {
    type: "siren",
    regex: /\b\d{3}\s\d{3}\s\d{3}\b/gd,
    validate: isPlausibleSirenDigits,
  },
  {
    type: "siren",
    regex: /\b(?<![A-Z]{2}\d{2}\s)\d{9}\b/gd,
    validate: isPlausibleSirenDigits,
  },

  // --- Social security (NIR) ---
  {
    type: "ssn",
    regex: new RegExp(
      `\\b(?i:NIR|Numéro\\s+de\\s+sécurité\\s+sociale|Numero\\s+de\\s+securite\\s+sociale|n°\\s*(?:de\\s+)?sécurité\\s+sociale|n°\\s*SS|n°\\s*sécu)${LABEL}([12][\\s.]?\\d{2}(?:[\\s.]?\\d{2}){2}[\\s.]?\\d{3}[\\s.]?\\d{3}[\\s.]?\\d{2,3})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "ssn",
    regex: /\b[12][\s.]?\d{2}(?:[\s.]?\d{2}){2}[\s.]?\d{3}[\s.]?\d{3}[\s.]?\d{2,3}\b/gd,
  },
  {
    type: "ssn",
    regex: /\b[12]\d{13}\b/gd,
  },

  // --- IBAN ---
  {
    type: "iban",
    regex: new RegExp(
      `\\b(?i:IBAN|RIB)${LABEL}((?:FR\\d{2}(?:\\s?\\d{4}){5}\\s?\\d{3}|[A-Z]{2}\\d{2}(?:\\s?[A-Z0-9]{4}){2,7}\\s?[A-Z0-9]{1,4}))\\b`,
      UNICODE_FLAGS,
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
      `\\b(?i:Carte\\s+bancaire|Carte\\s+bleue|N°\\s*de\\s*carte|Numéro\\s+de\\s+carte|Numero\\s+de\\s+carte|CB)${LABEL}((?:\\d{4}[ \\t]){3}\\d{4})\\b`,
      UNICODE_FLAGS,
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
      `\\b(?i:Tél(?:éphone)?|Tél\\.|Telephone|GSM|Mobile|Portable|Fixe|Fax)(?:\\s+[^:]+)?${LABEL}((?:\\+33|0)[\\s.\\-]?[1-9](?:[\\s.\\-]?\\d{2}){4})\\b`,
      UNICODE_FLAGS,
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
      `\\b(?i:Date\\s+de\\s+naissance|DDN|N[ée]e?\\s+le|Naissance)${LABEL}(\\d{1,2}[\\/\\-\\.]\\d{1,2}[\\/\\-\\.]\\d{2,4})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "dateOfBirth",
    regex: new RegExp(
      `\\b(?i:Date\\s+de\\s+naissance|N[ée]e?\\s+le)${LABEL}(\\d{1,2}\\s+(?:${FRENCH_MONTHS})\\s+\\d{4})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "dateOfBirth",
    regex: /\(né\s+le\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\)/gdu,
    groupIndex: 1,
  },

  // --- Postal code (Python: CODE_POSTAL) ---
  {
    type: "postalCode",
    regex: new RegExp(
      `\\b(?i:Code\\s+postal|CP|Cedex)${LABEL}(\\d{5})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },


  // --- Organization (Python: ORG) ---
  {
    type: "organization",
    regex: new RegExp(
      `\\b(?i:Organisation|Organization|Société|Societe|Entreprise|Groupe|Cabinet|Raison\\s+sociale)${LABEL}(${ORG_BODY})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "organization",
    regex: new RegExp(
      `\\b(?:SARL|SA|SAS|SASU|EURL|SCI|SNC|GIE)\\s+(${ORG_BODY})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },

  // --- Location (Python: LOC / GPE → LIEU) ---
  {
    type: "location",
    regex: new RegExp(
      `\\b(?i:Ville|Lieu|Localité|Localite|Région|Region|Commune)${LABEL}(${LOCATION_BODY})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },

  // --- Generic identifier (Python: NRP → IDENTIFIANT) ---
  {
    type: "identifier",
    regex: new RegExp(
      `\\b(?i:TVA)(?:\\s+intracommunautaire)?${LABEL}([A-Z]{2}\\s?\\d{2}\\s?\\d{9,12})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "identifier",
    regex: new RegExp(
      `\\b(?i:Référence|Reference|Réf|Ref|Identifiant|ID|N°|Numéro|Numero|Dossier|Contrat|Facture)${LABEL}(${IDENTIFIER_BODY})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },

  // --- General dates (Python: DATE_TIME → DATE) ---
  {
    type: "date",
    regex: new RegExp(
      `\\b\\d{1,2}\\s+(?:${FRENCH_MONTHS})\\s+\\d{4}\\b`,
      UNICODE_FLAGS,
    ),
  },
  {
    type: "date",
    regex: /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/gd,
  },

  // --- Address (labeled first, then full street+postal, then fragments) ---
  {
    type: "address",
    regex: new RegExp(
      `\\b(?i:Adresse|Adr\\.?)${LABEL}([^\\n\\r]+)`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "address",
    regex: new RegExp(
      `\\b${STREET_NUMBER}[ \\t]+(?i:${FRENCH_STREET_TYPES})\\s+${FRENCH_STREET_PARTICLE}?${STREET_BODY}${POSTAL_CITY}`,
      UNICODE_FLAGS,
    ),
  },
  {
    type: "address",
    regex: new RegExp(
      `\\b${STREET_NUMBER}[ \\t]+(?i:${FRENCH_STREET_TYPES})\\s+${FRENCH_STREET_PARTICLE}?${STREET_BODY}`,
      UNICODE_FLAGS,
    ),
  },
  {
    type: "address",
    regex:
      /\b\d{5}[ \t]+[\p{Lu}\p{Ll}\-]+(?:[ \t]+[\p{L}\-]+){0,3}\b/gdu,
  },

  // --- Email (French labels) ---
  {
    type: "email",
    regex: new RegExp(
      `\\b(?i:E-?mail|Courriel|Mél|Mel)(?:\\s+[^:]+)?${LABEL}([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },

  // --- Names (labeled, titles, list items, relatives, chez, unlabeled) ---
  {
    type: "name",
    regex: new RegExp(
      `\\b(?i:Nom(?:\\s+(?:complet|du\\s+dirigeant))?(?:\\s+et\\s+prénom)?|Prénom|Prenom|Identité|Identite)${LABEL}(${FRENCH_NAME_SEQUENCE})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex: new RegExp(
      `\\b(?i:Autre\\s+contact|Collaborateur|Dirigeant|Client)${LABEL}(?:(?:${FRENCH_TITLES})\\s+)?(${FRENCH_NAME_SEQUENCE})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex: new RegExp(
      `\\b(?:${FRENCH_TITLES})\\s+(${FRENCH_NAME_SEQUENCE})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex: new RegExp(
      `(?:^|[\\n\\r])[-•]\\s*(${FRENCH_NAME_SEQUENCE})${LABEL}`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex: new RegExp(
      `\\b(?:sa |son |leur )?(?:sœur|soeur|frère|frere|mère|mere|père|pere|épouse|epouse|fille|fils|mari|femme|ami|amie|collègue|collegue|avocat)\\s+(?:(?:${FRENCH_TITLES})\\s+)?(${FRENCH_NAME_SEQUENCE})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex: new RegExp(
      `(?:\\b|(?<=[ \\t]))(?:L[''])?(?:entreprise|société|societe|cabinet|office)\\s+de\\s+(${FRENCH_NAME_SEQUENCE})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex: new RegExp(
      `\\bchez\\s+(${NAME_TOKEN}[ \\t]+${NAME_TOKEN})\\b`,
      UNICODE_FLAGS,
    ),
    groupIndex: 1,
  },
  {
    type: "name",
    regex: new RegExp(
      `\\b(${FRENCH_NAME_SEQUENCE})\\b`,
      UNICODE_FLAGS,
    ),
    validate: isLikelyFrenchFullName,
  },
];