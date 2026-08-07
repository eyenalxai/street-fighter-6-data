import type { OxlintConfig } from "oxlint"

import { rules } from "./rules.ts"

type PluginConfig = NonNullable<OxlintConfig["plugins"]>
type SettingsConfig = NonNullable<OxlintConfig["settings"]>
type OverridesConfig = NonNullable<OxlintConfig["overrides"]>

const plugins: PluginConfig = [
  "typescript",
  "unicorn",
  "oxc",
  "promise",
  "import",
  "node",
  "react",
  "react-perf",
]

const categories: NonNullable<OxlintConfig["categories"]> = {
  correctness: "error",
  suspicious: "error",
  perf: "error",
  pedantic: "error",
  style: "error",
  restriction: "error",
}

const settings: SettingsConfig = {
  react: {
    version: "19.2.8",
  },
}

const ignorePatterns = [
  "**/node_modules/**",
  "**/dist/**",
  "**/.output/**",
  "**/*.d.ts",
  "**/*.config.{js,ts,mjs,cjs}",
  "**/tsconfig.tsbuildinfo",
  "src/components/ui/**",
]

const routeFileOverrides: OverridesConfig = [
  {
    files: ["src/routes/**/*.{ts,tsx}"],
    rules: {
      "import/group-exports": "off",
    },
  },
]

const toolingFileOverrides: OverridesConfig = [
  {
    files: ["oxlint.config.ts"],
    rules: {
      "import/no-default-export": "off",
    },
  },
]

const createOxlintConfig = (): OxlintConfig => {
  return {
    plugins,
    categories,
    rules,
    env: {
      builtin: true,
    },
    ignorePatterns,
    settings,
    overrides: [...routeFileOverrides, ...toolingFileOverrides],
  }
}

export { createOxlintConfig }
