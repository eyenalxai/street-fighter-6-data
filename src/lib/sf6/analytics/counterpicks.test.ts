import { expect, test } from "bun:test"

import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"
import type { UsageBlock } from "@/lib/sf6/snapshots/usage.server"

import { getCounterpickCandidates } from "./counterpicks"

const block: ProcessedDiaLeague = {
  p: ["ryu", "ken", "chunli"],
  m: [
    [null, 0.6, null],
    [0.4, null, 0.7],
    [0.5, 0.3, null],
  ],
}
const usage: UsageBlock = {
  rank: "all-master",
  playerControl: "combined",
  rows: [
    { characterId: "ryu", playRate: 60, previousRate: 0, count: 1 },
    { characterId: "chunli", playRate: 40, previousRate: 0, count: 1 },
  ],
}

test("counterpick candidates require complete selected-opponent coverage", () => {
  const result = getCounterpickCandidates(block, "combined", ["ryu", "chunli"], usage, "weighted")
  expect(result.excludedCandidateCount).toBe(2)
  expect(result.selectedUsageShare).toBe(100)
  expect(result.weightCoverage).toBe(1)
  expect(result.rows.map((row) => row.characterId)).toEqual(["ken"])
  expect(result.rows[0]?.weightedAverage).toBe(52)
})

test("counterpick coverage clamps floating-point summation noise", () => {
  const result = getCounterpickCandidates(
    block,
    "combined",
    ["ken", "chunli", "ryu"],
    {
      rank: "all-master",
      playerControl: "combined",
      rows: [
        { characterId: "ryu", playRate: 0.3, previousRate: 0, count: 1 },
        { characterId: "chunli", playRate: 0.2, previousRate: 0, count: 1 },
        { characterId: "ken", playRate: 0.1, previousRate: 0, count: 1 },
      ],
    },
    "weighted",
  )
  expect(result.weightCoverage).toBe(1)
  expect(result.selectedUsageShare).toBe(100)
})
