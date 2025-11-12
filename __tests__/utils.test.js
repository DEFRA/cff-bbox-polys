import { describe, it, expect } from 'vitest'
import {
  escapeHtml,
  sanitizeInputForText,
  isResultInEngland,
  parseJsonSafe
} from '../public/js/utils'

describe('utils', () => {
  it('escapeHtml escapes special characters', () => {
    const input = '<script>alert("x")</script>&'
    expect(escapeHtml(input)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&amp;'
    )
  })

  it('sanitizeInputForText strips disallowed characters and trims', () => {
    const input = ' Paris!!! <> /\\ -- '
    const out = sanitizeInputForText(input)
    expect(out).toBe('Paris!!! /\\ --')
  })

  it('isResultInEngland returns true for english address', () => {
    const res = {
      address: { formattedAddress: 'London, England', countryRegionIso2: 'GB' }
    }
    expect(isResultInEngland(res)).toBe(true)
  })

  it('isResultInEngland returns false for non-uk', () => {
    const res = {
      address: { formattedAddress: 'Paris, France', countryRegionIso2: 'FR' }
    }
    expect(isResultInEngland(res)).toBe(false)
  })

  it('isResultInEngland returns false for Scotland', () => {
    const res = {
      address: {
        formattedAddress: 'Edinburgh, Scotland',
        countryRegionIso2: 'GB'
      }
    }
    expect(isResultInEngland(res)).toBe(false)
  })

  it('parseJsonSafe returns value for valid JSON', () => {
    const input = '{"a":1}'
    const r = parseJsonSafe(input)
    expect(r.ok).toBe(true)
    expect(r.value).toEqual({ a: 1 })
  })

  it('parseJsonSafe returns error for invalid JSON', () => {
    const input = '{a:1'
    const r = parseJsonSafe(input)
    expect(r.ok).toBe(false)
    expect(typeof r.error).toBe('string')
  })
})
