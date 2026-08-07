import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
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
