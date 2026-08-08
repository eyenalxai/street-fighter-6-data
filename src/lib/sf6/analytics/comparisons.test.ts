import { expect, test } from "bun:test"

import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"
import type { UsageBlock } from "@/lib/sf6/snapshots/usage.server"

import type { MetricEntry } from "./comparisons"

import { getRosterMetrics } from "./comparisons"

const makeBlock = (ryuAgainstKen: number): ProcessedDiaLeague => {
  return {
    p: ["ryu", "ken"],
    m: [
      [null, ryuAgainstKen],
      [1 - ryuAgainstKen, null],
    ],
  }
}
const makeUsage = (ryu: number, ken: number): UsageBlock => {
  return {
    rank: "all-master",
    playerControl: "combined",
    rows: [
      { characterId: "ryu", playRate: ryu, previousRate: 0, count: 1 },
      { characterId: "ken", playRate: ken, previousRate: 0, count: 1 },
    ],
  }
}
const entry = (
  period: string,
  matchup: number,
  ryuUsage: number,
  kenUsage: number,
): MetricEntry => {
  return {
    period,
    block: makeBlock(matchup),
    controlBlocks: null,
    usage: makeUsage(ryuUsage, kenUsage),
  }
}

test("roster metrics calculate later-minus-earlier deltas and debut markers", () => {
  const rows = getRosterMetrics(
    entry("202606", 0.6, 80, 20),
    {
      ...entry("202605", 0.5, 0, 100),
      usage: {
        ...makeUsage(0, 100),
        rows: [{ characterId: "ken", playRate: 100, previousRate: 0, count: 1 }],
      },
    },
    "combined",
    ["ryu", "ken"],
  )
  expect(rows.find((row) => row.characterId === "ryu")).toMatchObject({
    performanceDelta: 10,
    usageDelta: null,
    debut: true,
  })
  expect(rows.find((row) => row.characterId === "ken")).toMatchObject({
    performanceDelta: -10,
    usageDelta: -80,
    debut: false,
  })
})
