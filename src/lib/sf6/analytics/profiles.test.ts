import { expect, test } from "bun:test"

import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"

import { getMatchupProfile, getSimilarProfiles } from "./profiles"

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

test("weighted disadvantage contributions use normalized percentage-point shares", () => {
  const profile = getMatchupProfile(profileBlock, "combined", "ryu", {
    rank: "all-master",
    playerControl: "combined",
    rows: [
      { characterId: "chunli", playRate: 20, previousRate: 0, count: 1 },
      { characterId: "zangief", playRate: 80, previousRate: 0, count: 1 },
    ],
  })
  const chunli = profile.rows.find((row) => row.opponentId === "chunli")
  const zangief = profile.rows.find((row) => row.opponentId === "zangief")
  expect(chunli?.weightedDisadvantageContribution).toBe(2)
  expect(zangief?.weightedDisadvantageContribution).toBe(16)
  expect(
    profile.rows.reduce((sum, row) => sum + (row.weightedDisadvantageContribution ?? 0), 0),
  ).toBe(18)
})
