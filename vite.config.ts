import { fileURLToPath, URL } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

/**
 * GitHub Pages serves a project repo from `https://<user>.github.io/<repo>/`,
 * so every asset URL needs that prefix. Derive it from the environment GitHub
 * Actions already provides instead of hardcoding a name that can drift if the
 * repo is ever renamed.
 *
 * - `<user>.github.io` repos and custom domains serve from the root  → '/'
 * - any other repo                                                   → '/<repo>/'
 * - local dev / preview                                              → '/'
 */
function resolveBase() {
  if (process.env.VITE_BASE) return process.env.VITE_BASE
  if (!process.env.GITHUB_ACTIONS) return '/'

  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  if (!repo || repo.endsWith('.github.io')) return '/'
  return `/${repo}/`
}

// https://vite.dev/config/
export default defineConfig({
  base: resolveBase(),
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Playwright's webServer targets this exact port; fail loudly instead of
    // silently drifting to 5174 when something else is already bound.
    strictPort: true,
  },
})
