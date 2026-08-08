import { expect, test } from "bun:test"

import type { UsageBlock } from "@/lib/sf6/snapshots/usage.server"

import { getUsageDelta, getUsageRate, getUsageStability, getUsageStats } from "./usage"

const block = (rows: UsageBlock["rows"]): UsageBlock => {
  return {
    rank: "all-master",
    playerControl: "combined",
    rows,
  }
}

test("usage stats normalize rounded shares and calculate diversity", () => {
  const stats = getUsageStats(
    block([
      { characterId: "ryu", playRate: 60, previousRate: 0, count: 1 },
      { characterId: "ken", playRate: 30, previousRate: 0, count: 1 },
      { characterId: "chunli", playRate: 10, previousRate: 0, count: 1 },
    ]),
  )
  expect(stats.topFiveShare).toBe(100)
  expect(stats.effectiveRosterSize).toBeCloseTo(2.45, 2)
})

test("usage deltas preserve absent characters as unavailable", () => {
  const before = block([{ characterId: "ryu", playRate: 20, previousRate: 0, count: 1 }])
  const after = block([{ characterId: "ryu", playRate: 25, previousRate: 0, count: 1 }])
  expect(getUsageRate(before, "ken")).toBeNull()
  expect(getUsageDelta(before, after, "ryu").delta).toBe(5)
  expect(getUsageDelta(before, after, "ken").delta).toBeNull()
  expect(
    getUsageStability([
      { period: "202605", playRate: 20 },
      { period: "202606", playRate: 25 },
    ]).largestAdjacentChange,
  ).toBe(5)
})
