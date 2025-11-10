import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Serve static assets but don't auto-serve index.html so the root route can be rendered by Nunjucks
// Serve static files from `public/` but don't auto-serve index.html so the root route can be rendered by Nunjucks
app.use(express.static(path.join(__dirname, 'public')))

// Serve GOV.UK compiled assets at /assets so their CSS (which references absolute /assets/ paths)
// resolves without copying files around. This points /assets -> public/govuk/assets
app.use(
  '/assets',
  express.static(path.join(__dirname, 'public', 'govuk', 'assets'))
)

const bingMapsKey =
  process.env.BING_MAPS_KEY || process.env.FLOOD_APP_BING_MAPS_KEY

app.get('/config', (req, res) => {
  res.json({ bingMapsKey })
})

// No server-side templating — serve the static `public/index.html` as the app root
// (Express static middleware will automatically serve /index.html)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
