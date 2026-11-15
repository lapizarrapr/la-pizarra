import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// Two projects:
//  - unit: pure functions, no database needed (fast, runs anywhere)
//  - int:  Payload Local API against the test database (needs Postgres running)
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'int',
          environment: 'node',
          setupFiles: ['./vitest.setup.ts'],
          include: ['tests/int/**/*.int.spec.ts'],
          fileParallelism: false,
          testTimeout: 60_000,
          hookTimeout: 120_000,
        },
      },
    ],
  },
})
