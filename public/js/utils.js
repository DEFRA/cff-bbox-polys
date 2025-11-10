// Small client-side helpers extracted for testing

/**
 * Sanitizes user input by removing unwanted characters.
 * Allows letters, numbers, spaces, common punctuation, and a few symbols.
 * @param {string} value - The input string to sanitize.
 * @param {number} maxLength - Optional max length of the result.
 * @returns {string} - Sanitized string.
 */
function sanitizeInputForText(value, maxLength = 200) {
  if (!value) return '';
  let s = String(value).trim();

  // Allow common punctuation and symbols: ! / \ [ ] # @ : , . ( ) _ -
  // eslint-disable-next-line no-useless-escape
  s = s.replace(/[^A-Za-z0-9 \-,.()_\/\\!\[\]#@:]/g, '');
  s = s.replace(/\s{2,}/g, ' '); // Collapse multiple spaces

  if (s.length > maxLength) {
    s = s.substring(0, maxLength);
  }

  return s;
}

/**
 * Simple HTML-escape helper to prevent injection when using innerHTML
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Checks if a result is located in England based on address fields.
 */
function isResultInEngland(res) {
  if (!res || !res.address) return false;
  const addr = res.address;

  if (addr.formattedAddress && /\bEngland\b/i.test(addr.formattedAddress)) return true;
  if (addr.countryRegionIso2 && addr.countryRegionIso2.toUpperCase() !== 'GB') return false;
  if (addr.countryRegion && !/United Kingdom|UK/i.test(addr.countryRegion)) return false;
  if (addr.adminDistrict && /\bEngland\b/i.test(addr.adminDistrict)) return true;

  const notEnglandPattern = /\bScotland\b|\bWales\b|\bNorthern Ireland\b|\bNI\b/i;
  if (
    (addr.formattedAddress && notEnglandPattern.test(addr.formattedAddress)) ||
    (addr.adminDistrict && notEnglandPattern.test(addr.adminDistrict)) ||
    (addr.subdivision && notEnglandPattern.test(addr.subdivision))
  ) {
    return false;
  }

  return true;
}

/**
 * Safely parses JSON and returns a structured result to avoid throwing in callers.
 */
function parseJsonSafe(text) {
  if (typeof text !== 'string') {
    return { ok: false, error: 'Input is not a string' };
  }

  try {
    const v = JSON.parse(text);
    return { ok: true, value: v };
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e) };
  }
}

module.exports = {
  escapeHtml,
  sanitizeInputForText,
  isResultInEngland,
  parseJsonSafe,
};