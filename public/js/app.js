/* public/js/app.js
   Extracted from inline script in index.html.
   Exposes loadMapScenario on window for Bing Maps callback.
*/

/* global Microsoft, alert */

let map, bboxShape, polygonShape

// Helper: decide if a Bing Search result (or reverseGeocode result) is in England.
function isResultInEngland(res) {
  if (!res || !res.address) return false
  const addr = res.address

  // If the formatted address explicitly contains 'England', accept.
  if (addr.formattedAddress && /\bEngland\b/i.test(addr.formattedAddress))
    {return true}

  // If country code is not GB, reject early.
  if (addr.countryRegionIso2 && addr.countryRegionIso2.toUpperCase() !== 'GB')
    {return false}
  if (addr.countryRegion && !/United Kingdom|UK/i.test(addr.countryRegion)) {
    // If country region isn't the UK, reject.
    return false
  }

  // If adminDistrict explicitly equals 'England' accept
  if (addr.adminDistrict && /\bEngland\b/i.test(addr.adminDistrict)) return true

  // If there are explicit mentions of other UK constituent countries, reject
  const notEnglandPattern =
    /\bScotland\b|\bWales\b|\bNorthern Ireland\b|\bNI\b/i
  if (
    (addr.formattedAddress && notEnglandPattern.test(addr.formattedAddress)) ||
    (addr.adminDistrict && notEnglandPattern.test(addr.adminDistrict)) ||
    (addr.subdivision && notEnglandPattern.test(addr.subdivision))
  ) {
    return false
  }

  // Last-resort: country is UK and no explicit other-constituent mention — accept.
  return true
}

// Render a GOV.UK error summary into #error-summary-container and focus it for accessibility
function renderGovukError(message, targetId) {
  const container = document.getElementById('error-summary-container')
  if (!container) {
    alert(message)
    return
  }

  // Build body: either a single paragraph or a list with a link to the target input
  let bodyHtml = `<p>${message}</p>`
  if (targetId) {
    // Create a single-item list that links to the input by id (GOV.UK error summary style)
    bodyHtml = `
          <ul class="govuk-error-summary__list">
            <li><a href="#${targetId}" class="govuk-link">${message}</a></li>
          </ul>
        `
  }

  container.innerHTML = `
      <div class="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabindex="-1">
        <h2 class="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
        <div class="govuk-error-summary__body">
          ${bodyHtml}
        </div>
      </div>
    `

  // Focus the injected error summary for screen readers
  const err = container.querySelector('.govuk-error-summary')
  if (err)
    {err.focus()

    // Initialize govuk-frontend behaviors on the newly-inserted node if available.
    // First try dynamic import (works if govuk-frontend is provided as an ES module).
    // If that doesn't work (or the file is provided as a non-module script),
    // inject a non-module script tag and call the global init.
  ;}(function initGovukFrontend() {
    // Attempt dynamic import (module-aware)
    try {
      import("../../../../../../govuk/govuk-frontend.min.js")
        .then((m) => {
          if (m && typeof m.initAll === 'function') {
            m.initAll()
            return
          }
          // If dynamic import succeeded but didn't expose initAll, fall through
          // to non-module loader below to try global init.
          loadNonModuleScript()
        })
        .catch(() => {
          // dynamic import failed; try non-module loader
          loadNonModuleScript()
        })
    } catch (e) {
      // import threw synchronously (older browsers), try non-module loader
      loadNonModuleScript()
    }

    function loadNonModuleScript() {
      // If global already present and has initAll, call it
      if (
        window.GOVUKFrontend &&
        typeof window.GOVUKFrontend.initAll === 'function'
      ) {
        try {
          window.GOVUKFrontend.initAll()
        } catch (e) {
          /* ignore */
        }
        return
      }

      // Prevent adding multiple script tags
      if (document.querySelector('script[data-govuk-frontend-fallback]')) return

      const s = document.createElement('script')
      s.setAttribute('src', '/govuk/govuk-frontend.min.js')
      s.setAttribute('data-govuk-frontend-fallback', '1')
      s.onload = function () {
        try {
          if (
            window.GOVUKFrontend &&
            typeof window.GOVUKFrontend.initAll === 'function'
          ) {
            window.GOVUKFrontend.initAll()
          }
        } catch (e) {
          /* ignore errors during init */
        }
      }
      s.onerror = function () {
        // silent fail — the markup will still be visible without JS behaviors
      }
      document.head.appendChild(s)
    }
  })()

  // If the error link was injected, attach a click handler to focus the target element properly
  if (targetId) {
    const link = container.querySelector(`a[href="#${targetId}"]`)
    if (link) {
      link.addEventListener('click', function (ev) {
        ev.preventDefault()
        const target = document.getElementById(targetId)
        if (target) {
          target.focus()
        }
      })
    }
  }
}

// Clear any rendered GOV.UK error summary
function clearGovukError() {
  const container = document.getElementById('error-summary-container')
  if (!container) return
  container.innerHTML = ''
}

async function loadMapScenario() {
  const response = await fetch('/config')
  const config = await response.json()

  map = new Microsoft.Maps.Map(document.getElementById('map'), {
    credentials: config.bingMapsKey
  })

  Microsoft.Maps.loadModule(
    ['Microsoft.Maps.SpatialMath', 'Microsoft.Maps.Search'],
    function () {
      console.log('Modules loaded.')
    }
  )
}

// Make callback available globally for the Bing Maps script
window.loadMapScenario = loadMapScenario

function searchLocation() {
  const query = document.getElementById('locationSearch').value
  if (!query) {
    renderGovukError('Please enter a location.', 'locationSearch')
    return
  }

  const searchManager = new Microsoft.Maps.Search.SearchManager(map)
  searchManager.geocode({
    where: query,
    callback: function (result) {
      if (result && result.results && result.results.length > 0) {
        const top = result.results[0]
        // Only accept results in England
        if (!isResultInEngland(top)) {
          renderGovukError(
            'Location is outside England. Please search for a location within England.',
            'locationSearch'
          )
          return
        }

        const bbox = top.bestView

        const bboxArray = [
          bbox.center.longitude - bbox.width / 2,
          bbox.center.latitude - bbox.height / 2,
          bbox.center.longitude + bbox.width / 2,
          bbox.center.latitude + bbox.height / 2
        ]
        document.getElementById('bbox').value = JSON.stringify(
          bboxArray,
          null,
          2
        )
        // Successful search — clear any previous error and draw
        clearGovukError()
        drawShapes()
      } else {
        renderGovukError('Location not found.', 'locationSearch')
      }
    },
    errorCallback: function () {
      renderGovukError('Search failed.', 'locationSearch')
    }
  })
}

function useMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const delta = 0.01
        const bboxArray = [lng - delta, lat - delta, lng + delta, lat + delta]
        // Populate bbox and draw shapes
        document.getElementById('bbox').value = JSON.stringify(
          bboxArray,
          null,
          2
        )

        // Try to reverse-geocode the coordinates to a friendly name and populate the search box
        try {
          const searchManager = new Microsoft.Maps.Search.SearchManager(map)
          searchManager.reverseGeocode({
            location: new Microsoft.Maps.Location(lat, lng),
            callback: function (res) {
              // Only proceed if reverse-geocode indicates England
              if (!isResultInEngland(res)) {
                renderGovukError(
                  'Your current location appears to be outside England. The app only accepts locations in England.'
                )
                drawShapes()
                return
              }

              if (res && res.name) {
                const input = document.getElementById('locationSearch')
                if (input) input.value = res.name
              } else if (res && res.address && res.address.formattedAddress) {
                const input = document.getElementById('locationSearch')
                if (input) input.value = res.address.formattedAddress
              }
              // Reverse-geocode success: clear any previous error
              clearGovukError()
              drawShapes()
            },
            errorCallback: function () {
              // On failure, still draw shapes
              drawShapes()
            }
          })
        } catch (e) {
          // If search manager or reverseGeocode isn't available, just draw
          drawShapes()
        }
      },
      function () {
        renderGovukError('Unable to retrieve your location.')
      }
    )
  } else {
    renderGovukError('Geolocation is not supported by your browser.')
  }
}

function drawShapes() {
  let bboxArray = [];
    let polyJson = []
  let hasBBox = false;
    let hasPolygon = false

  try {
    const bboxText = document.getElementById('bbox').value.trim()
    if (bboxText) {
      bboxArray = JSON.parse(bboxText)
      hasBBox = true
    }
    const polyText = document.getElementById('polygon').value.trim()
    if (polyText) {
      polyJson = JSON.parse(polyText)
      hasPolygon = true
    }
  } catch (e) {
    document.getElementById('result').innerText = '❌ Invalid JSON format.'
    return
  }

  map.entities.clear()
  let locations = []

  if (hasBBox) {
    const [minLng, minLat, maxLng, maxLat] = bboxArray
    const bboxCorners = [
      new Microsoft.Maps.Location(minLat, minLng),
      new Microsoft.Maps.Location(minLat, maxLng),
      new Microsoft.Maps.Location(maxLat, maxLng),
      new Microsoft.Maps.Location(maxLat, minLng),
      new Microsoft.Maps.Location(minLat, minLng)
    ]
    bboxShape = new Microsoft.Maps.Polygon(bboxCorners, {
      fillColor: 'rgba(0,0,255,0.3)',
      strokeColor: 'blue'
    })
    map.entities.push(bboxShape)
    locations = locations.concat(bboxCorners)
  }

  if (hasPolygon) {
    const polyInput = polyJson.map(
      (pair) => new Microsoft.Maps.Location(pair[1], pair[0])
    )
    polygonShape = new Microsoft.Maps.Polygon(polyInput, {
      fillColor: 'rgba(255,0,0,0.3)',
      strokeColor: 'red'
    })
    map.entities.push(polygonShape)
    locations = locations.concat(polyInput)
  }

  let intersects = false
  if (hasBBox && hasPolygon) {
    intersects = Microsoft.Maps.SpatialMath.Geometry.intersects(
      bboxShape,
      polygonShape
    )
  }

  if (locations.length > 0) {
    const bounds = Microsoft.Maps.LocationRect.fromLocations(locations)
    map.setView({ bounds, padding: 50 })
  }

  document.getElementById('result').innerText =
    hasBBox && hasPolygon
      ? intersects
        ? '✅ Shapes intersect!'
        : '❌ No intersection.'
      : '✅ Shapes drawn.'
}

// Attach event listeners for buttons if present (keeps HTML clean)
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('locationSearchButton')
  if (searchBtn) searchBtn.addEventListener('click', searchLocation)

  const myLocBtn = document.getElementById('useMyLocationButton')
  if (myLocBtn) myLocBtn.addEventListener('click', useMyLocation)

  const drawBtn = document.getElementById('drawShapesButton')
  if (drawBtn) drawBtn.addEventListener('click', drawShapes)

  // Trigger search on Enter in the location input
  const locationInput = document.getElementById('locationSearch')
  if (locationInput) {
    locationInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        searchLocation()
      }
    })
  }

  // Trigger draw on Ctrl/Cmd+Enter in bbox and polygon textareas
  const bboxArea = document.getElementById('bbox')
  const polyArea = document.getElementById('polygon')
  const drawOnCtrlEnter = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      drawShapes()
    }
  }
  if (bboxArea) bboxArea.addEventListener('keydown', drawOnCtrlEnter)
  if (polyArea) polyArea.addEventListener('keydown', drawOnCtrlEnter)
})
