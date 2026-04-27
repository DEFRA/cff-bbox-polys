import {
  setBingResponseOnElement,
  stringifyBingResponse
} from './bing-response.js'

describe('#stringifyBingResponse', () => {
  test('returns pretty JSON for payload', () => {
    const payload = { resourceSets: [{ estimatedTotal: 1 }] }

    expect(stringifyBingResponse(payload)).toBe(
      JSON.stringify(payload, null, 2)
    )
  })

  test('returns empty string for empty payload', () => {
    expect(stringifyBingResponse(null)).toBe('')
    expect(stringifyBingResponse(undefined)).toBe('')
  })
})

describe('#setBingResponseOnElement', () => {
  test('sets response value on target element', () => {
    const responseElement = { value: '' }
    const payload = { name: 'Leeds' }

    setBingResponseOnElement(responseElement, payload)

    expect(responseElement.value).toBe(JSON.stringify(payload, null, 2))
  })

  test('clears response value when payload is empty', () => {
    const responseElement = { value: 'existing value' }

    setBingResponseOnElement(responseElement, null)

    expect(responseElement.value).toBe('')
  })

  test('does nothing when element is missing', () => {
    expect(() => setBingResponseOnElement(null, { ok: true })).not.toThrow()
  })
})
