import { describe, expect, test } from "bun:test"

import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"

import {
  getAvailableOpponentCharacterIds,
  getAvailablePlayerCharacterIds,
  getCounterpickCandidates,
  getMatchupAverage,
  getMatchupCell,
} from "./matchups"

const combinedBlock: ProcessedDiaLeague = {
  p: ["ryu", "ken", "guile", "honda", "lily"],
  m: [
    [null, 0.5034, 0.49, 0.51, 0.52],
    [0.4966, null, 0.51, 0.5, 0.48],
    [0.6, 0.59, 0.58, 0.57, null],
    [0.55, 0.54, null, 0.53, 0.52],
    [0.51, null, 0.5, 0.49, null],
  ],
}

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

describe("matchup cells and averages", () => {
  test("only same-control same-character cells are mirrors", () => {
    expect(getMatchupCell(combinedBlock, "combined", "ryu", "ryu").status).toBe("mirror")
    expect(getMatchupCell(controlBlock, "classic-modern", "ryu", "ryu")).toEqual({
      playerId: "ryu",
      opponentId: "ryu",
      status: "numeric",
      winRate: 53.12,
    })
  })

  test("combined availability is unconstrained while combined lookup remains exact", () => {
    expect(getAvailablePlayerCharacterIds(controlBlock, "combined")).toEqual(["ryu", "ken"])
    expect(getAvailableOpponentCharacterIds(controlBlock, "combined")).toEqual(["ryu", "ken"])
    expect(getMatchupCell(controlBlock, "combined", "ryu", "ken").status).toBe("unavailable")
  })

  test("averages use source precision and include mixed-control same-character cells", () => {
    const average = getMatchupAverage(controlBlock, "classic-modern", "ryu")
    expect(average?.winRate).toBeCloseTo((53.12 + 51.78) / 2, 10)
  })
})

describe("counterpick coverage", () => {
  test("excludes incomplete candidates and keeps complete statistics comparable", () => {
    const result = getCounterpickCandidates(combinedBlock, "combined", ["ryu", "ken"])

    expect(result.excludedCandidateCount).toBe(3)
    expect(result.rows.map((row) => row.characterId)).toEqual(["guile", "honda"])
    expect(result.rows[0]).toEqual({
      characterId: "guile",
      averageWinRate: (60 + 59) / 2,
      worstWinRate: 59,
      atOrAbove50Count: 2,
      matchups: [
        { opponentId: "ryu", winRate: 60 },
        { opponentId: "ken", winRate: 59 },
      ],
    })
  })

  test("allows a mixed-control same-character candidate when its cell is numeric", () => {
    const result = getCounterpickCandidates(controlBlock, "classic-modern", ["ryu"])

    expect(result.rows.some((row) => row.characterId === "ryu")).toBe(true)
  })
})
