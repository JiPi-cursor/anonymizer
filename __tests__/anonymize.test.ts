import { describe, expect, it } from "vitest";
import { anonymizeText } from "@/lib/anonymize";

const SAMPLE_DOCUMENT = `Patient Record
Name: John Smith
Email: john.smith@example.com
Phone: (555) 123-4567
DOB: 03/15/1985
SSN: 123-45-6789
Address: 742 Evergreen Terrace, Springfield`;

describe("anonymizeText", () => {
  it("masks email addresses with typed tags", () => {
    const result = anonymizeText("Contact me at jane.doe@company.org today.");

    expect(result.anonymized).toMatch(/\[EMAIL_001\]/);
    expect(result.anonymized).not.toContain("jane.doe@company.org");
    expect(result.stats.byType.email).toBe(1);
  });

  it("masks US phone formats with typed tags", () => {
    const result = anonymizeText("Call (555) 123-4567 or 555-987-6543.");

    expect(result.anonymized).toMatch(/\[TEL_\d{3}\]/);
    expect(result.anonymized).not.toContain("(555) 123-4567");
    expect(result.stats.byType.phone).toBeGreaterThanOrEqual(1);
  });

  it("masks SSN with typed tags", () => {
    const dashed = anonymizeText("SSN 123-45-6789");
    const spaced = anonymizeText("SSN 123 45 6789");

    expect(dashed.anonymized).toBe("SSN [SSN_001]");
    expect(spaced.anonymized).toBe("SSN [SSN_001]");
  });

  it("masks labeled dates of birth with typed tags", () => {
    const result = anonymizeText("DOB: 03/15/1985");

    expect(result.anonymized).toBe("DOB: [DOB_001]");
    expect(result.stats.byType.dateOfBirth).toBe(1);
  });

  it("masks street addresses with typed tags", () => {
    const result = anonymizeText("Lives at 742 Evergreen Terrace");

    expect(result.anonymized).toMatch(/\[ADDR_001\]/);
    expect(result.anonymized).not.toContain("742 Evergreen Terrace");
  });

  it("masks labeled names with typed tags", () => {
    const result = anonymizeText("Name: John Smith");

    expect(result.anonymized).toBe("Name: [PER_001]");
    expect(result.stats.byType.name).toBe(1);
  });

  it("does not double-mask overlapping regions", () => {
    const result = anonymizeText("Email: test@example.com");

    const emailTags = result.anonymized.match(/\[EMAIL_\d{3}\]/g) ?? [];
    expect(emailTags).toHaveLength(1);
  });

  it("returns zero matches for clean text", () => {
    const result = anonymizeText("This document has no sensitive values.");

    expect(result.stats.total).toBe(0);
    expect(result.anonymized).toBe(result.original);
    expect(result.mapping).toHaveLength(0);
  });

  it("preserves non-PII content and produces a mapping", () => {
    const result = anonymizeText(SAMPLE_DOCUMENT);

    expect(result.anonymized).toContain("Patient Record");
    expect(result.anonymized).toMatch(/Name: \[PER_001\]/);
    expect(result.anonymized).toMatch(/Email: \[EMAIL_001\]/);
    expect(result.anonymized).toMatch(/Phone: \[TEL_001\]/);
    expect(result.anonymized).not.toContain("(555)");
    expect(result.anonymized).toMatch(/DOB: \[DOB_001\]/);
    expect(result.anonymized).toMatch(/SSN: \[SSN_001\]/);
    expect(result.anonymized).toMatch(/Address: \[ADDR_001\]/);
    expect(result.stats.total).toBeGreaterThanOrEqual(6);
    expect(result.mapping.length).toBeGreaterThan(0);
  });
});

const FRENCH_SAMPLE = `Dossier Patient
Nom et prénom : Marie Dupont
Téléphone : 06 12 34 56 78
Date de naissance : 15/03/1985
NIR : 2 85 03 75 123 456 78
IBAN : FR76 1234 5678 9012 3456 7890 123
Adresse : 12 rue de la République, 75001 Paris
Contactez Jean-Pierre Martin pour le suivi.`;

describe("anonymizeText (French)", () => {
  it("masks French labeled names", () => {
    const result = anonymizeText("Nom : Dupont");

    expect(result.anonymized).toBe("Nom : [PER_001]");
  });

  it("masks French first and last names with accents", () => {
    const result = anonymizeText("Nom et prénom : Zoé Müller");

    expect(result.anonymized).toBe("Nom et prénom : [PER_001]");
    expect(result.anonymized).not.toContain("Zoé");
  });

  it("masks unlabeled French full names", () => {
    const result = anonymizeText("Contactez Jean-Pierre Martin pour le suivi.");

    expect(result.anonymized).toMatch(/\[PER_001\]/);
    expect(result.anonymized).not.toContain("Jean-Pierre");
    expect(result.anonymized).not.toContain("Martin");
  });

  it("masks French mobile and landline numbers", () => {
    const mobile = anonymizeText("Portable : 06.12.34.56.78");
    const landline = anonymizeText("Fixe : 01 23 45 67 89");
    const international = anonymizeText("Appeler +33 6 12 34 56 78");

    expect(mobile.anonymized).toMatch(/\[TEL_001\]/);
    expect(landline.anonymized).toMatch(/\[TEL_001\]/);
    expect(international.anonymized).toMatch(/\[TEL_001\]/);
    expect(mobile.anonymized).not.toContain("06.12.34.56.78");
  });

  it("masks French NIR social security numbers", () => {
    const spaced = anonymizeText("NIR : 2 85 03 75 123 456 78");
    const compact = anonymizeText("NIR 285037512345678");

    expect(spaced.anonymized).toMatch(/\[SSN_001\]/);
    expect(compact.anonymized).toMatch(/\[SSN_001\]/);
    expect(spaced.anonymized).not.toContain("285037512345678");
  });

  it("masks French IBAN numbers", () => {
    const labeled = anonymizeText("IBAN : FR76 1234 5678 9012 3456 7890 123");
    const compact = anonymizeText("Virement vers FR7612345678901234567890123");

    expect(labeled.anonymized).toMatch(/\[IBAN_001\]/);
    expect(compact.anonymized).toMatch(/\[IBAN_001\]/);
    expect(labeled.anonymized).not.toContain("FR76");
  });

  it("masks French dates of birth", () => {
    const numeric = anonymizeText("Date de naissance : 15/03/1985");
    const textual = anonymizeText("Né le : 15 mars 1985");

    expect(numeric.anonymized).toBe("Date de naissance : [DOB_001]");
    expect(textual.anonymized).toBe("Né le : [DOB_001]");
  });

  it("masks French addresses", () => {
    const street = anonymizeText("Domicile au 12 rue de la République");
    const postal = anonymizeText("Résidence à 75001 Paris");

    expect(street.anonymized).toMatch(/\[ADDR_001\]/);
    expect(street.anonymized).not.toContain("rue de la République");
    expect(postal.anonymized).toMatch(/\[ADDR_001\]/);
    expect(postal.anonymized).not.toContain("75001 Paris");
  });

  it("preserves French non-PII content in a full document", () => {
    const result = anonymizeText(FRENCH_SAMPLE);

    expect(result.anonymized).toContain("Dossier Patient");
    expect(result.anonymized).toMatch(/Nom et prénom : \[PER_001\]/);
    expect(result.anonymized).toMatch(/Téléphone : \[TEL_001\]/);
    expect(result.anonymized).toMatch(/Date de naissance : \[DOB_001\]/);
    expect(result.anonymized).toMatch(/NIR : \[SSN_001\]/);
    expect(result.anonymized).toMatch(/IBAN : \[IBAN_001\]/);
    expect(result.anonymized).toMatch(/Adresse : \[ADDR_001\]/);
    expect(result.anonymized).toMatch(/Contactez \[PER_\d{3}\] pour le suivi\./);
    expect(result.stats.total).toBeGreaterThanOrEqual(7);
  });
});