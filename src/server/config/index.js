/**
 * Config endpoint for providing Bing Maps key to the frontend
 */
export const configEndpoint = {
  plugin: {
    name: 'config',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/config',
          options: {
            auth: false
          },
          handler(_request, h) {
            const bingMapsKey =
              process.env.FLOOD_APP_BING_KEY_LOCATION ||
              process.env.BING_MAPS_KEY ||
              process.env.FLOOD_APP_BING_MAPS_KEY ||
              ''
            return h.response({ bingMapsKey }).type('application/json')
          }
        }
      ])
    }
  }
}
