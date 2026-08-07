import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths(),
    tanstackStart({
      router: {
        entry: "./app-router.tsx",
      },
    }),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
})
