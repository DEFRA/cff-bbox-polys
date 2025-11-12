'use strict'

require('dotenv').config()
const Hapi = require('@hapi/hapi')
const Path = require('path')
// Change the import path to point to public/js/utils.js
// ...existing code...

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  })

  // Register inert for static file handling
  await server.register(require('@hapi/inert'))

  // Serve static files from /public
  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        index: false // Don't auto-serve index.html
      }
    }
  })

  // Serve GOV.UK assets at /assets
  server.route({
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
      directory: {
        path: Path.join('govuk', 'assets')
      }
    }
  })

  // Config route for Bing Maps key
  const bingMapsKey =
    process.env.BING_MAPS_KEY || process.env.FLOOD_APP_BING_MAPS_KEY
  server.route({
    method: 'GET',
    path: '/config',
    handler: (request, h) => {
      return { bingMapsKey }
    }
  })

  // Serve index.html manually for root
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.file('index.html')
    }
  })

  await server.start()
  console.log(`Server running at ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})

init()
