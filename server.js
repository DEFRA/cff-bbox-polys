import 'dotenv/config'
import Hapi from '@hapi/hapi'
import Path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import Inert from '@hapi/inert'
import { homeController } from './src/server/home/controller.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// Change the import path to point to public/js/utils.js
// ...existing code...

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    routes: {
      files: {
        relativeTo: Path.join(__dirname)
      }
    }
  })

  // Register inert for static file handling
  await server.register(Inert)

  // Config route for Bing Maps key (must be before static file routes)
  const bingMapsKey =
    process.env.FLOOD_APP_BING_KEY_LOCATION ||
    process.env.BING_MAPS_KEY ||
    process.env.FLOOD_APP_BING_MAPS_KEY
  server.route({
    method: 'GET',
    path: '/config',
    handler: (request, h) => {
      return { bingMapsKey }
    }
  })

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

  // Serve index.html manually for root
  // Use the homeController for the root route
  server.route({
    method: 'GET',
    path: '/',
    handler: homeController.handler
  })

  await server.start()
  console.log(`Server running at ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})

init()
