// Small client-side helpers extracted for testing

// Simple HTML-escape helper to prevent injection when using innerHTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Strip special characters from user input, allow letters, numbers, spaces, comma, hyphen, and basic punctuation.
function sanitizeInputForText(value, maxLength = 200) {
  if (!value) return ''
  let s = String(value).trim()
  // Allow common punctuation like !, / and backslash; keep letters and numbers.
  s = s.replace(/[^A-Za-z0-9 \-,.()_\/\\!\[\]#@!:]/g, '')
  s = s.replace(/\s{2,}/g, ' ')
  if (s.length > maxLength) s = s.substring(0, maxLength)
  return s
}

function isResultInEngland(res) {
  if (!res || !res.address) return false
  const addr = res.address
  if (addr.formattedAddress && /\bEngland\b/i.test(addr.formattedAddress)) {
    return true
  }
  if (addr.countryRegionIso2 && addr.countryRegionIso2.toUpperCase() !== 'GB') {
    return false
  }
  if (addr.countryRegion && !/United Kingdom|UK/i.test(addr.countryRegion)) {
    return false
  }
  if (addr.adminDistrict && /\bEngland\b/i.test(addr.adminDistrict)) return true
  const notEnglandPattern =
    /\bScotland\b|\bWales\b|\bNorthern Ireland\b|\bNI\b/i
  if (
    (addr.formattedAddress && notEnglandPattern.test(addr.formattedAddress)) ||
    (addr.adminDistrict && notEnglandPattern.test(addr.adminDistrict)) ||
    (addr.subdivision && notEnglandPattern.test(addr.subdivision))
  ) {
    return false
  }
  return true
}

// Safely parse JSON and return structured result to avoid throwing in callers
function parseJsonSafe(text) {
  if (typeof text !== 'string') {
    return { ok: false, error: 'Input is not a string' }
  }
  try {
    const v = JSON.parse(text)
    return { ok: true, value: v }
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e) }
  }
}

module.exports = {
  escapeHtml,
  sanitizeInputForText,
  isResultInEngland,
  parseJsonSafe
}
