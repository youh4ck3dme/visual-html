import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Standalone test config: does NOT reuse vite.config.ts on purpose, to avoid
// loading the app's SSR/Nitro/Lovable plugin chain in the test runner.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup-mocks.ts", "src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globals: true,
    testTimeout: 20000,
    pool: "forks",
    // Avoid cross-file timing flakes when workers compete for CPU (builder generation waits).
    fileParallelism: false,
  },
});
