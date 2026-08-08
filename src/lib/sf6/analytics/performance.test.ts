import { expect, test } from "bun:test"

import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"
import type { ControlBlocks } from "@/lib/sf6/snapshots/dia.server"
import type { UsageBlock } from "@/lib/sf6/snapshots/usage.server"

import { getControlComparison, getPerformanceSummary } from "./performance"

const matchupBlock: ProcessedDiaLeague = {
  p: ["ryu", "ken", "chunli", "guile", "honda", "zangief", "cammy"],
  m: [
    [null, 0.6, 0.4, 0.55, 0.7, 0.3, 0.65],
    [0.4, null, 0.5, 0.5, 0.5, 0.5, 0.5],
    [0.6, 0.5, null, 0.5, 0.5, 0.5, 0.5],
    [0.45, 0.5, 0.5, null, 0.5, 0.5, 0.5],
    [0.3, 0.5, 0.5, 0.5, null, 0.5, 0.5],
    [0.7, 0.5, 0.5, 0.5, 0.5, null, 0.5],
    [0.35, 0.5, 0.5, 0.5, 0.5, 0.5, null],
  ],
}
const usage: UsageBlock = {
  rank: "all-master",
  playerControl: "combined",
  rows: [
    { characterId: "ken", playRate: 80, previousRate: 0, count: 1 },
    { characterId: "chunli", playRate: 20, previousRate: 0, count: 1 },
  ],
}
const controlBlocks: ControlBlocks = {
  "classic-classic": {
    p: [
      ["ryu", "C"],
      ["ken", "C"],
    ],
    m: [
      [null, 0.6],
      [0.4, null],
    ],
  },
  "classic-modern": {
    p: [
      ["ryu", "C"],
      ["ken", "M"],
    ],
    m: [
      [null, 0.4],
      [0.6, null],
    ],
  },
  "modern-classic": {
    p: [
      ["ryu", "M"],
      ["ken", "C"],
    ],
    m: [
      [null, 0.8],
      [0.2, null],
    ],
  },
  "modern-modern": {
    p: [
      ["ryu", "M"],
      ["ken", "M"],
    ],
    m: [
      [null, 0.6],
      [0.4, null],
    ],
  },
}

test("performance weighting renormalizes available opponent usage", () => {
  const summary = getPerformanceSummary(matchupBlock, "combined", "ryu", usage)
  expect(summary.unweightedAverage).toBeCloseTo(53.33, 2)
  expect(summary.weightedAverage).toBe(56)
  expect(summary.weightCoverage).toBe(1)
  expect(summary.floor).toBe(30)
  expect(summary.coverage).toBe(1)
  expect(summary.topThreeLift).toBeCloseTo(11.67, 2)
})

test("missing usage keeps weighted metrics unavailable without changing unweighted results", () => {
  const firstUsage = usage.rows.at(0)
  if (firstUsage === undefined) {
    throw new Error("Test fixture is missing usage")
  }
  const summary = getPerformanceSummary(matchupBlock, "combined", "ryu", {
    ...usage,
    rows: [{ ...firstUsage, characterId: "ed" }],
  })
  expect(summary.unweightedAverage).toBeCloseTo(53.33, 2)
  expect(summary.weightedAverage).toBeNull()
  expect(summary.weightCoverage).toBe(0)
})

test("performance coverage clamps floating-point summation noise", () => {
  const summary = getPerformanceSummary(
    {
      p: ["ryu", "ken", "chunli", "guile"],
      m: [
        [null, 0.5, 0.5, 0.5],
        [0.5, null, 0.5, 0.5],
        [0.5, 0.5, null, 0.5],
        [0.5, 0.5, 0.5, null],
      ],
    },
    "combined",
    "ryu",
    {
      rank: "all-master",
      playerControl: "combined",
      rows: [
        { characterId: "guile", playRate: 0.3, previousRate: 0, count: 1 },
        { characterId: "chunli", playRate: 0.2, previousRate: 0, count: 1 },
        { characterId: "ken", playRate: 0.1, previousRate: 0, count: 1 },
      ],
    },
  )
  expect(summary.weightCoverage).toBe(1)
})

test("player-control performance averages both opponent-control pairings", () => {
  const classicUsage: UsageBlock = {
    ...usage,
    playerControl: "classic",
    rows: [{ characterId: "ken", playRate: 50, previousRate: 0, count: 1 }],
  }
  const modernUsage: UsageBlock = {
    ...usage,
    playerControl: "modern",
    rows: [{ characterId: "ken", playRate: 50, previousRate: 0, count: 1 }],
  }
  const result = getControlComparison(controlBlocks, ["ryu"], {
    combined: usage,
    classic: classicUsage,
    modern: modernUsage,
  })[0]
  if (result === undefined) {
    throw new Error("Test fixture did not produce a control result")
  }
  expect(result.classic).toBe(50)
  expect(result.modern).toBe(70)
  expect(result.performanceDelta).toBe(20)
  expect(result.weightedClassic).toBe(50)
  expect(result.weightedModern).toBe(70)
})
