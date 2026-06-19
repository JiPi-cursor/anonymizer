/** Uppercase letter including Latin accented characters used in French names. */
export const NAME_CHAR = "A-Za-zÀ-ÖØ-öø-ÿ";

/** Single capitalized name token, including hyphenated forms (Jean-Pierre). */
export const NAME_TOKEN = `[A-ZÀ-ÖØ-Þ][${NAME_CHAR}]+(?:-[A-ZÀ-ÖØ-Þ][${NAME_CHAR}]+)?`;

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
  "chez",
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

/**
 * Returns true when a candidate full-name span looks like a French person name.
 */
export function isLikelyFrenchFullName(matchedText: string): boolean {
  const words = matchedText
    .split(/[ \t]+/)
    .map((word) => word.toLowerCase());

  if (words.length < 2 || words.length > 3) {
    return false;
  }

  if (FRENCH_NAME_FIRST_WORD_BLOCKLIST.has(words[0])) {
    return false;
  }

  return words.every(
    (word) =>
      !FRENCH_NAME_BLOCKLIST.has(word) && !FRENCH_NAME_STOPWORDS.has(word),
  );
}