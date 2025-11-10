
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  resolve: {
    extensions: ['.mjs', '.js', '.json'] // ✅ Add this
  },
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      exclude: [
        ...configDefaults.exclude,
        '.public',
        'coverage',
        'postcss.config.js',
        'stylelint.config.js'
      ]
    }
  }
})

