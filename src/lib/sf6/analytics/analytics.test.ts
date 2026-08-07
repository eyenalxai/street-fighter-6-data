import { describe, expect, test } from "bun:test"

import { getAvailablePeriods, getSnapshot } from "@/lib/sf6/snapshots.server"

import {
  getControlComparison,
  getPeriodComparison,
  getRankHeatmap,
  getRankProgression,
  getTrend,
} from "./aggregates"
import { getBalanceMetrics, getBalanceSummary } from "./balance"
import { getMatchupClusters } from "./clustering"
import {
  getAvailableCharacterIds,
  getControlCells,
  getCounterpicks,
  getLeaderboard,
  getMatchupCell,
} from "./matchups"
import { getSimilarCharacters } from "./similarity"

describe("ranked analytics", () => {
  test("reads matchup values on the corrected display scale", async () => {
    const snapshot = await getSnapshot("202607")
    const cell = getMatchupCell(snapshot, "8", "combined", "ryu", "ken")
    const leaderboard = getLeaderboard(snapshot, "8", "combined")

    expect(cell.status).toBe("numeric")
    expect(cell.winRate).toBeGreaterThan(0)
    expect(cell.winRate).toBeLessThan(100)
    expect(leaderboard.length).toBeGreaterThan(20)
    expect(leaderboard[0]?.winRate).toBeGreaterThanOrEqual(leaderboard.at(-1)?.winRate ?? 0)
  })

  test("computes rank, control, trend, and period comparisons", async () => {
    const [before, after] = await Promise.all([getSnapshot("202306"), getSnapshot("202607")])
    const periods = await getAvailablePeriods()
    const entries = await Promise.all(
      periods.slice(-3).map(async (period) => {
        return { period, snapshot: await getSnapshot(period) }
      }),
    )

    expect(getRankProgression(after, "ryu", "combined")).toHaveLength(8)
    expect(getRankHeatmap(after, "combined").length).toBeGreaterThan(20)
    expect(getControlComparison(after, "8").length).toBeGreaterThan(20)
    expect(getTrend(entries, "8", "ryu", "combined")).toHaveLength(3)
    expect(
      getPeriodComparison(
        { period: "202306", snapshot: before },
        { period: "202607", snapshot: after },
        "8",
        "combined",
      ).length,
    ).toBeGreaterThan(20)
  })

  test("computes direct controls, counterpicks, similarity, and balance", async () => {
    const snapshot = await getSnapshot("202607")
    const entries = [{ period: "202607", snapshot }]
    const controls = getControlCells(snapshot, "8", "ryu", "ken")
    const counterpicks = getCounterpicks(snapshot, "8", "combined", "ryu")
    const similar = getSimilarCharacters(snapshot, "8", "combined", "ryu")
    const clusters = getMatchupClusters(snapshot, "8", "combined", 4)
    const balance = getBalanceMetrics(snapshot, entries, "8", "combined")

    expect(controls).toHaveLength(4)
    expect(counterpicks.length).toBeGreaterThan(10)
    expect(similar.length).toBeGreaterThan(10)
    expect(clusters).toHaveLength(4)
    const clusterMembers = new Set(clusters.flatMap((cluster) => cluster.members))
    const available = getAvailableCharacterIds(snapshot, "8", "combined")
    expect(clusterMembers.size).toBe(available.length)
    expect(available.every((characterId) => clusterMembers.has(characterId))).toBe(true)
    expect(balance.length).toBeGreaterThan(20)
    expect(getBalanceSummary(balance).strongest).not.toBeNull()
  })
})
