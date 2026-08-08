import { expect, test } from "bun:test"

import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"

import type { MetricEntry } from "./comparisons"

import { getChangeSummary, getMatchupChanges, getMatchupChangesForPlayerControl } from "./changes"

const usage = {
  rank: "all-master" as const,
  playerControl: "combined" as const,
  rows: [
    { characterId: "ryu" as const, playRate: 50, previousRate: 0, count: 1 },
    { characterId: "ken" as const, playRate: 50, previousRate: 0, count: 1 },
  ],
}

const makeEntry = (block: ProcessedDiaLeague, controlBlock: ProcessedDiaLeague): MetricEntry => {
  return {
    period: "202606",
    block,
    controlBlocks: {
      "classic-classic": controlBlock,
      "classic-modern": controlBlock,
      "modern-classic": controlBlock,
      "modern-modern": controlBlock,
    },
    usage,
  }
}

test("matchup changes exclude cells that touch the 50% boundary", () => {
  const before: ProcessedDiaLeague = {
    p: ["ryu", "ken", "chunli"],
    m: [
      [null, 0.4, 0.5],
      [0.6, null, 0.5],
      [0.5, 0.5, null],
    ],
  }
  const after: ProcessedDiaLeague = {
    p: ["ryu", "ken", "chunli"],
    m: [
      [null, 0.6, 0.6],
      [0.4, null, 0.5],
      [0.4, 0.5, null],
    ],
  }
  const changes = getMatchupChanges(before, after, "combined")
  expect(changes.find((row) => row.characterId === "ryu" && row.opponentId === "ken")?.flip).toBe(
    true,
  )
  expect(
    changes.find((row) => row.characterId === "ryu" && row.opponentId === "chunli")?.flip,
  ).toBe(false)
})

test("selected control changes use both applicable control pairings", () => {
  const combined: ProcessedDiaLeague = {
    p: ["ryu", "ken"],
    m: [
      [null, 0.5],
      [0.5, null],
    ],
  }
  const beforeControl: ProcessedDiaLeague = {
    p: [
      ["ryu", "C"],
      ["ken", "C"],
      ["ken", "M"],
    ],
    m: [
      [null, 0.4, 0.6],
      [0.6, null, 0.5],
      [0.4, 0.5, null],
    ],
  }
  const afterControl: ProcessedDiaLeague = {
    ...beforeControl,
    m: [
      [null, 0.6, 0.4],
      [0.4, null, 0.5],
      [0.6, 0.5, null],
    ],
  }
  const before = makeEntry(combined, beforeControl)
  const after = makeEntry(combined, afterControl)
  const changes = getMatchupChangesForPlayerControl(before, after, "classic")
  expect(new Set(changes.map((row) => row.controlMatchup))).toEqual(
    new Set(["classic-classic", "classic-modern"]),
  )
  expect(changes.every((row) => row.controlMatchup !== "combined")).toBe(true)
  expect(getChangeSummary(before, "combined").matchupImbalance).toBe(0)
  expect(getChangeSummary(before, "classic").matchupImbalance).toBe(7.5)
})
