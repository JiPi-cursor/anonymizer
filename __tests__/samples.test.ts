import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { anonymizeText } from "@/lib/anonymize";
import { createMappingFile, deanonymizeText } from "@/lib/mapping";

const SAMPLE_PATH = join(process.cwd(), "samples", "test1.txt");

/** PII fragments from samples/test1.txt that must not survive anonymization. */
const SAMPLE_PII_FRAGMENTS = [
  "Jean Dupont",
  "jean.dupont@email.com",
  "jean.dupont@entreprise.fr",
  "06 12 34 56 78",
  "01 45 67 89 10",
  "1 85 12 34 567 890 12",
  "15/05/1985",
  "FR76 1234 5678 9012 3456 7890 123",
  "4974 1234 5678 9012",
  "42 Rue des Lilas",
  "75020 Paris",
  "Marie Martin",
  "15 Avenue Victor Hugo",
  "69002 Lyon",
];

describe("samples/test1.txt", () => {
  it("redacts all reference PII with typed tags", () => {
    const input = readFileSync(SAMPLE_PATH, "utf-8");
    const result = anonymizeText(input, "test1.txt");

    for (const fragment of SAMPLE_PII_FRAGMENTS) {
      expect(result.anonymized).not.toContain(fragment);
    }

    expect(result.anonymized).toMatch(/Nom : \[PER_001\]/);
    expect(result.anonymized).toMatch(/Adresse : \[ADDR_001\]/);
    expect(result.anonymized).toMatch(/Téléphone : \[TEL_001\]/);
    expect(result.anonymized).toMatch(/Numéro de sécurité sociale : \[SSN_001\]/);
    expect(result.anonymized).toMatch(/Date de naissance : \[DOB_001\]/);
    expect(result.anonymized).toMatch(/IBAN : \[IBAN_001\]/);
    expect(result.anonymized).toMatch(/Carte bancaire : \[CARD_001\]/);
    expect(result.anonymized).toMatch(
      /chez sa sœur \[PER_\d{3}\] au \[ADDR_\d{3}\]/,
    );
    expect(result.stats.total).toBeGreaterThanOrEqual(13);
    expect(result.mapping.length).toBeGreaterThanOrEqual(10);
  });

  it("restores the original sample via mapping round-trip", () => {
    const input = readFileSync(SAMPLE_PATH, "utf-8");
    const result = anonymizeText(input, "test1.txt");
    const mapping = createMappingFile(result.mapping, "test1.txt");
    const restored = deanonymizeText(result.anonymized, mapping);

    expect(restored).toBe(input);
  });
});