// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const electronDev = process.env.ELECTRON === "1";

export default defineConfig({
  vite: {
    server: electronDev
      ? {
          host: "127.0.0.1",
          port: 5173,
          strictPort: true,
        }
      : undefined,
    build: {
      rolldownOptions: {
        external: ["@vercel/nft"],
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    // NOTE: Nitro preset is set to "vercel" via NITRO_PRESET env var in vercel.json
    // because @lovable.dev/vite-tanstack-config hardcodes the cloudflare preset.
    server: {
      entry: "server",
      // Avoid Nitro's nf3 tracing path (which imports @vercel/nft as a named ESM export).
      // Bundling server deps sidesteps the CJS/ESM interop bug in this toolchain combo.
      nitro: {
        noExternals: true,
      },
    },
  },
});
