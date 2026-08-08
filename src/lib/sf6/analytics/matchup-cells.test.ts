import { expect, test } from "bun:test"

import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"

import { getMatchupCell } from "./matchup-cells"

const block: ProcessedDiaLeague = {
  p: [
    ["ryu", "C"],
    ["ken", "C"],
    ["ken", "M"],
  ],
  m: [
    [null, 0.6, 0.55],
    [0.4, null, null],
    [0.45, null, null],
  ],
}

test("matchup cells distinguish numeric, mirror, and unavailable results", () => {
  expect(getMatchupCell(block, "classic-classic", "ryu", "ken")).toMatchObject({
    status: "numeric",
    winRate: 60,
  })
  expect(getMatchupCell(block, "classic-classic", "ryu", "chunli")).toMatchObject({
    status: "unavailable",
    winRate: null,
  })
  expect(getMatchupCell(block, "classic-classic", "ken", "ken")).toMatchObject({
    status: "mirror",
    winRate: null,
  })
})
