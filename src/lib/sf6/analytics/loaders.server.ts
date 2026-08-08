import type { PlayerControl, ReportingPeriod } from "@/lib/sf6/model"
import type { RankId, Rank } from "@/lib/sf6/ranks"

import { getEffectivePlayerControl } from "@/lib/sf6/rank-selection"
import { getRankBlock, getRankControlBlocks } from "@/lib/sf6/snapshots/dia.server"
import { getUsageBlock } from "@/lib/sf6/snapshots/usage.server"

import type { MetricEntry } from "./comparisons"

const getMetricEntry = async (
  period: ReportingPeriod,
  rank: RankId,
  requestedControl: PlayerControl,
): Promise<MetricEntry> => {
  const playerControl = getEffectivePlayerControl(rank, requestedControl)
  const [block, controlBlocks, usage] = await Promise.all([
    getRankBlock(period, rank, "combined"),
    getRankControlBlocks(period, rank),
    getUsageBlock(period, rank, playerControl),
  ])
  if (playerControl === "combined") {
    return { period, block, controlBlocks, usage }
  }
  const [classic, modern] = await Promise.all([
    getUsageBlock(period, rank, "classic"),
    getUsageBlock(period, rank, "modern"),
  ])
  return {
    period,
    block,
    controlBlocks,
    usage,
    usageControls: { classic, modern },
  }
}

const getRankEntries = async (
  period: ReportingPeriod,
  ranks: readonly Rank[],
): Promise<{ rank: Rank; entry: MetricEntry }[]> =>
  Promise.all(
    ranks.map(async (rank) => {
      return {
        rank,
        entry: await getMetricEntry(period, rank.id, "combined"),
      }
    }),
  )

const getPeriodEntries = async (
  periods: readonly ReportingPeriod[],
  rank: RankId,
  playerControl: PlayerControl,
): Promise<MetricEntry[]> =>
  Promise.all(periods.map(async (period) => getMetricEntry(period, rank, playerControl)))

export { getMetricEntry, getPeriodEntries, getRankEntries }
