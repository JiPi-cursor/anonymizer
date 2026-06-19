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
  it("masks email addresses", () => {
    const result = anonymizeText("Contact me at jane.doe@company.org today.");

    expect(result.anonymized).toContain("[EMAIL_REDACTED]");
    expect(result.anonymized).not.toContain("jane.doe@company.org");
    expect(result.stats.byType.email).toBe(1);
  });

  it("masks US phone formats", () => {
    const result = anonymizeText("Call (555) 123-4567 or 555-987-6543.");

    expect(result.anonymized).toContain("[PHONE_REDACTED]");
    expect(result.anonymized).not.toContain("(555) 123-4567");
    expect(result.stats.byType.phone).toBeGreaterThanOrEqual(1);
  });

  it("masks SSN with dashes and spaces", () => {
    const dashed = anonymizeText("SSN 123-45-6789");
    const spaced = anonymizeText("SSN 123 45 6789");

    expect(dashed.anonymized).toBe("SSN [SSN_REDACTED]");
    expect(spaced.anonymized).toBe("SSN [SSN_REDACTED]");
  });

  it("masks labeled dates of birth", () => {
    const result = anonymizeText("DOB: 03/15/1985");

    expect(result.anonymized).toBe("DOB: [DOB_REDACTED]");
    expect(result.stats.byType.dateOfBirth).toBe(1);
  });

  it("masks street addresses", () => {
    const result = anonymizeText("Lives at 742 Evergreen Terrace");

    expect(result.anonymized).toContain("[ADDRESS_REDACTED]");
    expect(result.anonymized).not.toContain("742 Evergreen Terrace");
  });

  it("masks labeled names", () => {
    const result = anonymizeText("Name: John Smith");

    expect(result.anonymized).toBe("Name: [NAME_REDACTED]");
    expect(result.stats.byType.name).toBe(1);
  });

  it("does not double-mask overlapping regions", () => {
    const result = anonymizeText("Email: test@example.com");

    expect(result.anonymized).not.toMatch(
      /\[EMAIL_REDACTED\].*\[EMAIL_REDACTED\]/,
    );
  });

  it("returns zero matches for clean text", () => {
    const result = anonymizeText("This document has no sensitive values.");

    expect(result.stats.total).toBe(0);
    expect(result.anonymized).toBe(result.original);
  });

  it("preserves non-PII content exactly", () => {
    const result = anonymizeText(SAMPLE_DOCUMENT);

    expect(result.anonymized).toContain("Patient Record");
    expect(result.anonymized).toContain("Name: [NAME_REDACTED]");
    expect(result.anonymized).toContain("Email: [EMAIL_REDACTED]");
    expect(result.anonymized).toContain("Phone: [PHONE_REDACTED]");
    expect(result.anonymized).not.toContain("(555)");
    expect(result.anonymized).toContain("DOB: [DOB_REDACTED]");
    expect(result.anonymized).toContain("SSN: [SSN_REDACTED]");
    expect(result.anonymized).toContain("Address: [ADDRESS_REDACTED]");
    expect(result.stats.total).toBeGreaterThanOrEqual(6);
  });
});