function normalizePlate(value = '') {
  return String(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function plateMatches(expected, detected) {
  const a = normalizePlate(expected);
  const b = normalizePlate(detected);
  if (!a || !b) return false;
  if (a === b) return true;

  // OCR commonly confuses O/0, I/1, S/5, B/8.
  const fix = s => s.replace(/O/g,'0').replace(/I/g,'1').replace(/S/g,'5').replace(/B/g,'8');
  return fix(a) === fix(b);
}

module.exports = { normalizePlate, plateMatches };
