import type { OxlintConfig } from "oxlint"

type RuleConfig = NonNullable<OxlintConfig["rules"]>

const frontendRuleOverrides: RuleConfig = {
  "react/react-compiler": "error",
  "react/jsx-no-literals": "off",
  "react/react-in-jsx-scope": "off",
  "react/jsx-filename-extension": "off",
  "react-perf/jsx-no-new-function-as-prop": "off",
  "react/jsx-max-depth": "off",
  "react-perf/jsx-no-new-array-as-prop": "off",
  "react-perf/jsx-no-new-object-as-prop": "error",
  "react/no-children-prop": "error",
  "react-perf/jsx-no-jsx-as-prop": "off",
  "react/jsx-handler-names": "off",
  "react/only-export-components": "off",
  "react/jsx-props-no-spreading": "off",
  "react/no-multi-comp": "off",
  "react/hook-use-state": "off",
  "react/forbid-component-props": "off",
  "react/function-component-definition": "off",
}

export { frontendRuleOverrides }
