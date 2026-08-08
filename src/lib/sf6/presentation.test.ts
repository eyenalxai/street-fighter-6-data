import { expect, test } from "bun:test"

import {
  formatCounterpickCoverage,
  formatLaterMinusEarlier,
  formatPeriodArrow,
  formatPeriodRange,
  MATCHUP_STATUS_LABELS,
} from "./presentation"

test("formatPeriodArrow and formatPeriodRange use formatted reporting periods", () => {
  expect(formatPeriodArrow("202401", "202406")).toBe("Jan 2024 → Jun 2024")
  expect(formatPeriodRange("202401", "202406")).toBe("Jan 2024 through Jun 2024")
})

test("formatLaterMinusEarlier returns a stable delta note", () => {
  expect(formatLaterMinusEarlier()).toBe("Later minus earlier.")
})

test("formatCounterpickCoverage handles known and unknown values", () => {
  expect(formatCounterpickCoverage(12.3, 0.75)).toContain("12.3%")
  expect(formatCounterpickCoverage(12.3, 0.75)).toContain("75%")
  expect(formatCounterpickCoverage(null, null)).toContain("unknown usage share")
  expect(formatCounterpickCoverage(null, null)).toContain("weight coverage is unknown")
})

test("MATCHUP_STATUS_LABELS maps internal statuses to product labels", () => {
  expect(MATCHUP_STATUS_LABELS.numeric).toBe("Reported")
  expect(MATCHUP_STATUS_LABELS.mirror).toBe("Mirror matchup")
  expect(MATCHUP_STATUS_LABELS.unavailable).toBe("Unavailable")
})
