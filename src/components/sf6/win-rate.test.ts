import { expect, test } from "bun:test"

import { formatPercentagePoints, getDisplayedDelta } from "./win-rate"

test("delta presentation classifies values by their displayed precision", () => {
  expect(getDisplayedDelta(0.04)).toBe(0)
  expect(getDisplayedDelta(-0.04)).toBe(0)
  expect(formatPercentagePoints(0.04)).toBe("0.0 pp")
  expect(formatPercentagePoints(-0.04)).toBe("0.0 pp")
  expect(formatPercentagePoints(0.06)).toBe("+0.1 pp")
  expect(formatPercentagePoints(-0.06)).toBe("−0.1 pp")
})
