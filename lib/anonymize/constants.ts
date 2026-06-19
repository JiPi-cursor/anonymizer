/** Unicode-aware name token (requires `u` regex flag). */
export const NAME_TOKEN = "[\\p{Lu}][\\p{L}'’]+(?:-[\\p{Lu}][\\p{L}'’]+)?";

/** Flexible label separator used in French forms, e.g. "Nom :". */
export const FRENCH_LABEL_SEP = "\\s*:\\s*";

/** French month names for date-of-birth detection. */
export const FRENCH_MONTHS =
  "janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre";

/** French street-type keywords (used inside a case-insensitive group). */
export const FRENCH_STREET_TYPES =
  "rue|avenue|av\\.?|boulevard|bd\\.?|impasse|allée|allee|all\\.?|place|chemin|route|cours|quai|passage|square|voie|sentier|résidence|residence|lotissement|hameau|lieu-dit|cité|cite|esplanade|parvis|montée|montee|ruelle|traverse|domaine|clos|zac|za|zi";

/** Optional French street particle between type and name. */
export const FRENCH_STREET_PARTICLE =
  "(?:de\\s+la\\s+|de\\s+l['']|du\\s+|des\\s+(?:d['']|l[''])?|d['']?)";

/** French honorifics and professional titles. */
export const FRENCH_TITLES =
  "Maître|Maitre|Me\\.?|Monsieur|Madame|Mademoiselle|M\\.|Mme|Mlle|Professeur|Prof\\.?|Docteur|Dr\\.?";

/** First token blocklist for unlabeled full-name heuristics (verbs, determiners, etc.). */
export const FRENCH_NAME_FIRST_WORD_BLOCKLIST = new Set([
  "ce",
  "cet",
  "cette",
  "ces",
  "matin",
  "soir",
  "hier",
  "aujourd",
  "contactez",
  "appelez",
  "demandez",
  "écrivez",
  "ecrivez",
  "voir",
  "chez",
  "merci",
  "bonjour",
  "cordialement",
  "sincèrement",
  "sincerement",
  "son",
  "sa",
  "ses",
  "leur",
  "leurs",
  "mon",
  "ma",
  "mes",
  "notre",
  "nos",
  "votre",
  "vos",
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "du",
  "au",
  "aux",
  "il",
  "elle",
  "ils",
  "elles",
  "pour",
  "par",
  "sur",
  "sous",
  "avec",
  "sans",
  "dans",
  "entre",
  "après",
  "apres",
  "avant",
  "depuis",
  "selon",
  "contre",
  "vers",
  "l",
  "d",
  "n",
]);

/**
 * Words that should not be treated as personal names when matched
 * by the unlabeled first-name + last-name heuristic.
 */
export const FRENCH_NAME_BLOCKLIST = new Set([
  "paris",
  "lyon",
  "marseille",
  "toulouse",
  "nice",
  "nantes",
  "bordeaux",
  "lille",
  "strasbourg",
  "montpellier",
  "rennes",
  "grenoble",
  "dijon",
  "france",
  "belgique",
  "europe",
  "rue",
  "avenue",
  "boulevard",
  "place",
  "chemin",
  "route",
  "saint",
  "sainte",
  "janvier",
  "février",
  "fevrier",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "aout",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
  "decembre",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
  "monsieur",
  "madame",
  "mademoiselle",
  "docteur",
  "médecin",
  "medecin",
  "maître",
  "maitre",
  "patient",
  "dossier",
  "document",
  "contrat",
  "facture",
  "rendez-vous",
  "rendez",
  "vous",
  "email",
  "courriel",
  "téléphone",
  "telephone",
  "adresse",
  "numéro",
  "numero",
  "sécurité",
  "securite",
  "sociale",
  "anonymisation",
  "confidentiel",
  "document",
  "entreprise",
  "contact",
  "autres",
  "contacts",
  "test",
]);

/** Prepositions and conjunctions that terminate a name span in running text. */
export const FRENCH_NAME_STOPWORDS = new Set([
  "au",
  "aux",
  "en",
  "à",
  "a",
  "ou",
  "et",
  "de",
  "des",
  "du",
  "la",
  "le",
  "les",
  "un",
  "une",
  "pour",
  "par",
  "sur",
  "sous",
  "dans",
  "chez",
  "avec",
  "sans",
  "entre",
  "contre",
  "vers",
  "depuis",
  "avant",
  "après",
  "apres",
]);

/** Up to three name tokens, allowing particles de/du/le. */
export const FRENCH_NAME_SEQUENCE = `${NAME_TOKEN}(?:[ \\t]+(?:(?:de|du|le)\\s+)?${NAME_TOKEN}){0,2}`;

/** Normalize a token for blocklist checks (strip leading French elisions). */
function normalizeNameToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/^l['']/, "")
    .replace(/^d['']/, "");
}

/**
 * Returns true when a candidate full-name span looks like a French person name.
 */
export function isLikelyFrenchFullName(matchedText: string): boolean {
  const words = matchedText
    .split(/[ \t]+/)
    .map((word) => normalizeNameToken(word))
    .filter((word) => !["de", "du", "le", "la"].includes(word));

  if (words.length < 2 || words.length > 3) {
    return false;
  }

  if (FRENCH_NAME_FIRST_WORD_BLOCKLIST.has(words[0])) {
    return false;
  }

  if (words.every((word) => word === word.toUpperCase() && word.length > 2)) {
    return false;
  }

  return words.every(
    (word) =>
      !FRENCH_NAME_BLOCKLIST.has(word) && !FRENCH_NAME_STOPWORDS.has(word),
  );
}