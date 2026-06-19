import { describe, expect, it } from "vitest";
import { anonymizeText } from "@/lib/anonymize";
import { TAG_PREFIXES } from "@/lib/anonymize/tags";
import { createMappingFile, deanonymizeText } from "@/lib/mapping";

const VALID_SIREN = "443 061 841";
const VALID_SIRET = "443 061 841 00047";

const CLEAR_PII_TYPES = [
  "name",
  "organization",
  "location",
  "email",
  "phone",
  "postalCode",
  "siret",
  "siren",
  "iban",
  "url",
  "date",
  "dateOfBirth",
  "identifier",
  "ssn",
  "creditCard",
  "address",
] as const;

describe("Python anonymizer perimeter alignment", () => {
  it("uses clear typed categories only (no vague NOM_PROPRE tags)", () => {
    expect(Object.keys(TAG_PREFIXES).sort()).toEqual(
      [...CLEAR_PII_TYPES].sort(),
    );
    expect(TAG_PREFIXES).not.toHaveProperty("properNoun");
  });

  it("masks SIRET and SIREN with dedicated tags", () => {
    const labeled = anonymizeText(
      `SIRET : ${VALID_SIRET}\nSIREN : ${VALID_SIREN}`,
    );
    const inline = anonymizeText(
      `Immatriculation ${VALID_SIRET} et siren ${VALID_SIREN}.`,
    );
    const contextual = anonymizeText(
      "(SIRET 456 789 123 00045)",
    );

    expect(labeled.anonymized).toMatch(/SIRET : \[SIRET_001\]/);
    expect(labeled.anonymized).toMatch(/SIREN : \[SIREN_001\]/);
    expect(inline.anonymized).toMatch(/\[SIRET_001\]/);
    expect(inline.anonymized).toMatch(/\[SIREN_001\]/);
    expect(contextual.anonymized).toBe("(SIRET [SIRET_001])");
    expect(labeled.anonymized).not.toContain(VALID_SIRET);
    expect(labeled.anonymized).not.toContain(VALID_SIREN);
  });

  it("masks postal codes, organizations, locations, URLs, dates, and identifiers", () => {
    const result = anonymizeText(
      [
        "Code postal : 75008",
        "Organisation : Hiram Finance",
        "Ville : Paris",
        "Site : https://example.com/report",
        "Référence : ABC-2024-77",
        "Signature le 15 mars 2026",
      ].join("\n"),
    );

    expect(result.anonymized).toMatch(/\[CODE_POSTAL_001\]/);
    expect(result.anonymized).toMatch(/\[ORG_001\]/);
    expect(result.anonymized).toMatch(/\[LIEU_001\]/);
    expect(result.anonymized).toMatch(/\[URL_001\]/);
    expect(result.anonymized).toMatch(/\[IDENTIFIANT_001\]/);
    expect(result.anonymized).toMatch(/\[DATE_001\]/);
    expect(result.anonymized).not.toContain("75008");
    expect(result.anonymized).not.toContain("Hiram Finance");
    expect(result.anonymized).not.toContain("https://example.com/report");
  });

  it("round-trips a mixed business document", () => {
    const input = [
      "Société : Hiram Finance",
      `SIREN : ${VALID_SIREN}`,
      `SIRET : ${VALID_SIRET}`,
      "Code postal : 75008",
      "Contact : contact@hiram.fr / 01 42 00 00 00",
      "Voir https://hiram.fr pour le détail.",
    ].join("\n");

    const result = anonymizeText(input, "business.txt");
    const restored = deanonymizeText(
      result.anonymized,
      createMappingFile(result.mapping, "business.txt"),
    );

    expect(restored).toBe(input);
  });
});