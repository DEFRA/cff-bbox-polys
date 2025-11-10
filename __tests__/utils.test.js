const {
  escapeHtml,
  sanitizeInputForText,
  isResultInEngland,
  parseJsonSafe,
} = require('../public/js/utils');

test('escapeHtml escapes special characters', () => {
  const input = '<script>alert("x")</script>&';
  expect(escapeHtml(input)).toBe(
    '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&amp;'
  );
});

test('sanitizeInputForText strips disallowed characters and trims', () => {
  const input = ' Paris!!! <> /\\ -- ';
  const out = sanitizeInputForText(input);
  expect(out).toBe('Paris!!! /\\ --');
});

test('isResultInEngland returns true for English address', () => {
  const res = {
    address: { formattedAddress: 'London, England', countryRegionIso2: 'GB' },
  };
  expect(isResultInEngland(res)).toBe(true);
});

test('isResultInEngland returns false for non-UK', () => {
  const res = {
    address: { formattedAddress: 'Paris, France', countryRegionIso2: 'FR' },
  };
  expect(isResultInEngland(res)).toBe(false);
});

test('isResultInEngland returns false for Scotland', () => {
  const res = {
    address: {
      formattedAddress: 'Edinburgh, Scotland',
      countryRegionIso2: 'GB',
    },
  };
  expect(isResultInEngland(res)).toBe(false);
});

test('parseJsonSafe returns value for valid JSON', () => {
  const input = '{"a":1}';
  const r = parseJsonSafe(input);
  expect(r.ok).toBe(true);
  expect(r.value).toEqual({ a: 1 });
});

test('parseJsonSafe returns error for invalid JSON', () => {
  const input = '{a:1';
  const r = parseJsonSafe(input);
  expect(r.ok).toBe(false);
  expect(typeof r.error).toBe('string');
});
