import { describe, expect, test } from "bun:test"

import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"

import type { ControlMatchupBlocks } from "./matchups"

import { getControlComparison, getPeriodComparison } from "./aggregates"

const controlBlock: ProcessedDiaLeague = {
  p: [
    ["ryu", "C"],
    ["ryu", "M"],
    ["ken", "C"],
    ["ken", "M"],
  ],
  m: [
    [null, 0.5312, 0.5423, 0.5178],
    [0.5011, null, 0.5266, null],
    [0.48, 0.49, null, 0.5],
    [0.51, null, 0.52, null],
  ],
}

const controlBlocks: ControlMatchupBlocks = {
  "classic-classic": controlBlock,
  "classic-modern": controlBlock,
  "modern-classic": controlBlock,
  "modern-modern": controlBlock,
}

describe("aggregate completeness and precision", () => {
  test("requires both opponent-control pairings for a player-control average", () => {
    const row = getControlComparison(controlBlocks).find(
      (candidate) => candidate.characterId === "ryu",
    )

    expect(row?.classic).toBeCloseTo((54.23 + (53.12 + 51.78) / 2) / 2, 10)
    expect(row?.modern).toBeNull()
    expect(row?.delta).toBeNull()
  })

  test("keeps period deltas at source precision", () => {
    const before: ProcessedDiaLeague = {
      p: ["ryu", "ken"],
      m: [
        [null, 0.5011],
        [0.4989, null],
      ],
    }
    const after: ProcessedDiaLeague = {
      p: ["ryu", "ken"],
      m: [
        [null, 0.5034],
        [0.4966, null],
      ],
    }

    const row = getPeriodComparison(
      { period: "202601", block: before },
      { period: "202602", block: after },
      "combined",
    ).find((candidate) => candidate.characterId === "ryu")

    expect(row?.before).toBeCloseTo(50.11, 10)
    expect(row?.after).toBeCloseTo(50.34, 10)
    expect(row?.delta).toBeCloseTo(0.23, 10)
  })
})
