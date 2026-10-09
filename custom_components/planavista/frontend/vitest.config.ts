import { defineConfig } from 'vitest/config';

// Run every test in the dev Home Assistant's zone (UTC-5/-6 with DST) so
// date bugs that only appear west of UTC reproduce on any machine. Forked
// workers inherit this; test/setup.ts sets it again inside each worker.
process.env.TZ = 'America/Chicago';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    pool: 'forks',
    setupFiles: ['./test/setup.ts'],
  },
});
