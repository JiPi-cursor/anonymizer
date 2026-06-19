/**
 * Normalize text to NFC so accented characters match regex patterns reliably.
 */
export function normalizeText(text: string): string {
  return text.normalize("NFC");
}