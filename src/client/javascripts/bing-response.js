export function stringifyBingResponse(payload) {
  return payload ? JSON.stringify(payload, null, 2) : ''
}

export function setBingResponseOnElement(responseElement, payload) {
  if (!responseElement) return
  responseElement.value = stringifyBingResponse(payload)
}
