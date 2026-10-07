export function normalizePlate(plate: string | null | undefined): string {
  if (!plate) return "";
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function plateMatches(expected: string, detected: string): boolean {
  const normExpected = normalizePlate(expected);
  const normDetected = normalizePlate(detected);

  if (!normExpected || !normDetected) return false;
  if (normExpected === normDetected) return true;

  if (normDetected.includes(normExpected) || normExpected.includes(normDetected)) {
    return true;
  }

  // Levenshtein distance check for minor OCR misreads
  let diff = 0;
  const maxLen = Math.max(normExpected.length, normDetected.length);
  const minLen = Math.min(normExpected.length, normDetected.length);

  diff += maxLen - minLen;
  for (let i = 0; i < minLen; i++) {
    if (normExpected[i] !== normDetected[i]) {
      diff++;
    }
  }

  return diff <= 2;
}
