/** Uppercase letter including Latin accented characters used in French names. */
export const NAME_CHAR = "A-Za-zÀ-ÖØ-öø-ÿ";

/** Single capitalized name token, including hyphenated forms (Jean-Pierre). */
export const NAME_TOKEN = `[A-ZÀ-ÖØ-Þ][${NAME_CHAR}]+(?:-[A-ZÀ-ÖØ-Þ][${NAME_CHAR}]+)?`;

/** French month names for date-of-birth detection. */
export const FRENCH_MONTHS =
  "janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre";

/** Common French street-type prefixes. */
export const FRENCH_STREET_TYPES =
  "rue|avenue|av\\.?|boulevard|bd\\.?|impasse|allée|allee|all\\.?|place|chemin|route|cours|quai|passage|square|voie|sentier|résidence|residence|lotissement|hameau|lieu-dit";

/** First token blocklist for unlabeled full-name heuristics (verbs, etc.). */
export const FRENCH_NAME_FIRST_WORD_BLOCKLIST = new Set([
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
  "patient",
  "dossier",
  "document",
  "contrat",
  "facture",
]);

/**
 * Returns true when a candidate first-name + last-name span looks like a person.
 */
export function isLikelyFrenchFullName(matchedText: string): boolean {
  const words = matchedText
    .split(/[ \t]+/)
    .map((word) => word.toLowerCase());

  if (words.length !== 2) {
    return false;
  }

  if (FRENCH_NAME_FIRST_WORD_BLOCKLIST.has(words[0])) {
    return false;
  }

  return words.every((word) => !FRENCH_NAME_BLOCKLIST.has(word));
}