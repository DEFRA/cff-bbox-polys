import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
export const homeController = {
  async handler(_request, h) {
    const filePath = path.join(__dirname, '../../../public/index.html')
    const htmlContent = await readFile(filePath, 'utf-8')
    return h.response(htmlContent).type('text/html')
  }
}
