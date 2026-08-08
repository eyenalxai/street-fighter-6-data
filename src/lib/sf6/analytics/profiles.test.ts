import { expect, test } from "bun:test"

import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"

import { getMatchupChanges } from "./changes"
import { getSimilarProfiles } from "./profiles"

const profileBlock: ProcessedDiaLeague = {
  p: ["ryu", "ken", "chunli", "guile", "honda", "zangief", "cammy"],
  m: [
    [null, 0.6, 0.4, 0.55, 0.7, 0.3, 0.65],
    [0.4, null, 0.6, 0.45, 0.7, 0.35, 0.65],
    [0.6, 0.4, null, 0.5, 0.5, 0.5, 0.5],
    [0.45, 0.55, 0.5, null, 0.5, 0.5, 0.5],
    [0.3, 0.3, 0.5, 0.5, null, 0.5, 0.5],
    [0.7, 0.65, 0.5, 0.5, 0.5, null, 0.5],
    [0.35, 0.35, 0.5, 0.5, 0.5, 0.5, null],
  ],
}

test("similar profiles require common numeric opponents and report overlap", () => {
  const similar = getSimilarProfiles(profileBlock, "combined", "ryu").find(
    (row) => row.characterId === "ken",
  )
  expect(similar).toBeDefined()
  if (similar !== undefined) {
    expect(similar.overlap).toBe(5)
    expect(similar.correlation).toBeGreaterThan(0)
  }
})

test("matchup flips exclude cells that touch the 50% boundary", () => {
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
