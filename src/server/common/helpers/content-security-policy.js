import Blankie from 'blankie'

/**
 * Manage content security policies.
 * @satisfies {import('@hapi/hapi').Plugin}
 */
const contentSecurityPolicy = {
  plugin: Blankie,
  options: {
    // Note: Removed SHA hash to allow 'unsafe-inline' for Bing Maps integration
    defaultSrc: ['self'],
    fontSrc: ['self', 'data:', 'blob:'],
    connectSrc: ['self', 'wss', 'data:', 'blob:', 'https:', 'http:'],
    mediaSrc: ['self'],
    styleSrc: ['self', "'unsafe-inline'", 'https:', 'blob:', 'data:'],
    scriptSrc: [
      'self',
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https:',
      'blob:',
      'data:'
    ],
    imgSrc: ['self', 'data:', 'blob:', 'https:', 'http:'],
    frameSrc: ['self', 'data:'],
    objectSrc: ['none'],
    frameAncestors: ['none'],
    formAction: ['self'],
    manifestSrc: ['self'],
    generateNonces: false
  }
}

export { contentSecurityPolicy }
