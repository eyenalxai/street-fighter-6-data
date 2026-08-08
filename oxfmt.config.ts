import { defineConfig } from "oxfmt"

export default defineConfig({
  ignorePatterns: ["data/processed/**", "data/raw/**"],
  sortImports: {
    groups: [
      "type-import",
      ["value-builtin", "value-external"],
      "type-internal",
      "value-internal",
      ["type-parent", "type-sibling", "type-index"],
      ["value-parent", "value-sibling", "value-index"],
      "unknown",
    ],
  },
  semi: false,
})
