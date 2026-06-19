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

const TEST2_PATH = join(process.cwd(), "samples", "test2.txt");

/** PII fragments from samples/test2.txt that must not survive anonymization. */
const TEST2_PII_FRAGMENTS = [
  "Jean-Pierre Dubois",
  "Sophie Laurent",
  "Marc Lefèvre",
  "Marie-Claire Moreau",
  "Thomas Moreau",
  "Émilie Petit",
  "Paul Martin-Dupont",
  "jean.dubois78@gmail.com",
  "jpdubois@consulting.fr",
  "contact@mcmoreau.fr",
  "emilie.petit92@orange.fr",
  "06 45 78 92 13",
  "01 47 58 96 32",
  "06 12 34 56 78",
  "01 42 68 35 79",
  "07 89 56 23 41",
  "06 55 44 33 22",
  "1 78 03 12 345 678 901",
  "12/03/1978",
  "05/11/1985",
  "FR14 3000 6000 1234 5678 9012 345",
  "4532 7812 4567 8901",
  "25 bis Avenue des Champs-Élysées",
  "8 Rue de la Paix, 69001 Lyon",
  "15 Boulevard Haussmann, 75009 Paris",
];

/** Non-PII phrases that must not be falsely tagged as names. */
const TEST2_FALSE_POSITIVES = [
  "ANONYMISATION TEST",
  "Sécurité Sociale",
  "Nom complet",
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

const TEST3_PATH = join(process.cwd(), "samples", "test3.txt");

/** PII fragments from samples/test3.txt that must not survive anonymization. */
const TEST3_PII_FRAGMENTS = [
  "SARL Dupont Construction",
  "123 456 789 00012",
  "123456789",
  "FR12 123456789",
  "Jean-Pierre Dubois",
  "Sophie Laurent",
  "Marc Lefèvre",
  "Marie-Claire Moreau",
  "456 789 123 00045",
  "987 654 321 00098",
  "contact@dupont-construction.fr",
  "sophie.laurent@avocat.fr",
  "06 45 78 92 13",
  "01 47 58 96 32",
  "12/03/1978",
  "05/11/1985",
  "FR14 3000 6000 1234 5678 9012 345",
  "4532 7812 4567 8901",
  "25 bis Avenue des Champs-Élysées",
];

/** Non-PII phrases that must remain visible in test3. */
const TEST3_FALSE_POSITIVES = [
  "TEST ANONYMISATION AVANCÉ",
  "TVA intracommunautaire",
  "Maître",
];

describe("samples/test2.txt", () => {
  it("redacts all reference PII with typed tags", () => {
    const input = readFileSync(TEST2_PATH, "utf-8");
    const result = anonymizeText(input, "test2.txt");

    for (const fragment of TEST2_PII_FRAGMENTS) {
      expect(result.anonymized).not.toContain(fragment);
    }

    for (const phrase of TEST2_FALSE_POSITIVES) {
      expect(result.anonymized).toContain(phrase);
    }

    expect(result.anonymized).toMatch(/Nom complet : \[PER_001\]/);
    expect(result.anonymized).toMatch(/Numéro de Sécurité Sociale : \[SSN_001\]/);
    expect(result.anonymized).toMatch(/son avocat Maître \[PER_002\]/);
    expect(result.anonymized).toMatch(/L'entreprise de \[PER_004\]/);
    expect(result.anonymized).toMatch(/\(né le \[DOB_002\]\)/);
    expect(result.anonymized).toMatch(/- \[PER_006\] : \[EMAIL_004\]/);
    expect(result.stats.total).toBeGreaterThanOrEqual(24);
    expect(result.mapping.length).toBeGreaterThanOrEqual(20);
  });

  it("restores the original sample via mapping round-trip", () => {
    const input = readFileSync(TEST2_PATH, "utf-8");
    const result = anonymizeText(input, "test2.txt");
    const mapping = createMappingFile(result.mapping, "test2.txt");
    const restored = deanonymizeText(result.anonymized, mapping);

    expect(restored).toBe(input);
  });
});

describe("samples/test3.txt", () => {
  it("redacts all reference PII with clear typed tags", () => {
    const input = readFileSync(TEST3_PATH, "utf-8");
    const result = anonymizeText(input, "test3.txt");

    for (const fragment of TEST3_PII_FRAGMENTS) {
      expect(result.anonymized).not.toContain(fragment);
    }

    for (const phrase of TEST3_FALSE_POSITIVES) {
      expect(result.anonymized).toContain(phrase);
    }

    expect(result.anonymized).not.toMatch(/\[NOM_PROPRE_/);
    expect(result.anonymized).toMatch(/Entreprise : \[ORG_001\]/);
    expect(result.anonymized).toMatch(/SIRET : \[SIRET_001\]/);
    expect(result.anonymized).toMatch(/SIREN : \[SIREN_001\]/);
    expect(result.anonymized).toMatch(/TVA intracommunautaire : \[IDENTIFIANT_001\]/);
    expect(result.anonymized).toMatch(/Autre contact : Maître \[PER_002\]/);
    expect(result.anonymized).toMatch(/\(SIRET \[SIRET_003\]\)/);
    expect(result.mapping.every((entry) => !entry.tag.includes("NOM_PROPRE"))).toBe(
      true,
    );
  });

  it("restores the original sample via mapping round-trip", () => {
    const input = readFileSync(TEST3_PATH, "utf-8");
    const result = anonymizeText(input, "test3.txt");
    const mapping = createMappingFile(result.mapping, "test3.txt");
    const restored = deanonymizeText(result.anonymized, mapping);

    expect(restored).toBe(input);
  });
});