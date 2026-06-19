import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { anonymizeText } from "@/lib/anonymize";

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
  it("redacts all reference PII from the sample document", () => {
    const input = readFileSync(SAMPLE_PATH, "utf-8");
    const result = anonymizeText(input);

    for (const fragment of SAMPLE_PII_FRAGMENTS) {
      expect(result.anonymized).not.toContain(fragment);
    }

    expect(result.anonymized).toContain("Nom : [NAME_REDACTED]");
    expect(result.anonymized).toContain("Adresse : [ADDRESS_REDACTED]");
    expect(result.anonymized).toContain("Téléphone : [PHONE_REDACTED]");
    expect(result.anonymized).toContain("Numéro de sécurité sociale : [SSN_REDACTED]");
    expect(result.anonymized).toContain("Date de naissance : [DOB_REDACTED]");
    expect(result.anonymized).toContain("IBAN : [IBAN_REDACTED]");
    expect(result.anonymized).toContain("Carte bancaire : [CARD_REDACTED]");
    expect(result.anonymized).toContain(
      "chez sa sœur [NAME_REDACTED] au [ADDRESS_REDACTED]",
    );
    expect(result.stats.total).toBeGreaterThanOrEqual(13);
  });
});