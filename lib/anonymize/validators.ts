/** Luhn checksum used by French SIREN and SIRET numbers. */
export function passesLuhnCheck(digits: string): boolean {
  if (!/^\d+$/.test(digits)) {
    return false;
  }

  let sum = 0;

  for (let index = digits.length - 1, alt = false; index >= 0; index -= 1) {
    let digit = Number.parseInt(digits[index], 10);

    if (alt) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    alt = !alt;
  }

  return sum % 10 === 0;
}

/** French mainland-style postal code (5 digits, plausible department). */
export function isLikelyFrenchPostalCode(value: string): boolean {
  const digits = value.replace(/\s/g, "");
  if (!/^\d{5}$/.test(digits)) {
    return false;
  }

  const department = Number.parseInt(digits.slice(0, 2), 10);
  return department >= 1 && department <= 98;
}

/** SIREN body: 9 digits, not all identical (reduces obvious false positives). */
export function isPlausibleSirenDigits(value: string): boolean {
  const digits = value.replace(/[\s.]/g, "");
  return (
    /^\d{9}$/.test(digits) && !/^(\d)\1{8}$/.test(digits)
  );
}

/** SIRET body: 14 digits with the same sanity check as SIREN. */
export function isPlausibleSiretDigits(value: string): boolean {
  const digits = value.replace(/[\s.]/g, "");
  return (
    /^\d{14}$/.test(digits) && !/^(\d)\1{13}$/.test(digits)
  );
}