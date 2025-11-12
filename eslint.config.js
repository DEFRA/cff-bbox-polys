import neostandard from 'neostandard'

export default neostandard({
  env: ['node', 'vitest'],
  ignores: [
    ...neostandard.resolveIgnoresFromGitignore(),
    'public/govuk/govuk-frontend.min.js',
    'public/js/app.js',
    'public/js/utils.js'
  ],
  noJsx: true,
  noStyle: true
})
