import type { CharacterId, PlayerControl, ReportingPeriod } from "@/lib/sf6/model"
import type { Rank } from "@/lib/sf6/ranks"
import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"
import type { ControlBlocks } from "@/lib/sf6/snapshots/dia.server"
import type { UsageBlock } from "@/lib/sf6/snapshots/usage.server"

import { CHARACTERS } from "@/lib/sf6/model"

import { getCharacterAverageWinRate, getAverageWinRateSummary } from "./average-win-rate"
import { getRankStability, getTimeStability } from "./stability"
import { getUsageDelta, getUsageRate, getUsageStats } from "./usage"

type MetricEntry = {
  period: ReportingPeriod
  block: ProcessedDiaLeague
  controlBlocks: ControlBlocks | null
  usage: UsageBlock
  usageControls?: Record<Exclude<PlayerControl, "combined">, UsageBlock>
}
type CharacterMetricRow = {
  characterId: CharacterId
  averageWinRate: number | null
  weightedAverageWinRate: number | null
  usage: number | null
  averageWinRateDelta: number | null
  weightedAverageWinRateDelta: number | null
  usageDelta: number | null
  debut: boolean
  floor: number | null
  favorableCount: number
  availableCount: number
  possibleCount: number
  weightCoverage: number | null
  topThreeLift: number | null
}
type LandscapePoint = {
  period: ReportingPeriod
  averageWinRateSpread: number | null
  topFiveShare: number
}
type RankLandscapePoint = {
  rankId: Rank["id"]
  label: string
  averageWinRateSpread: number | null
  topFiveShare: number
}
type RankMetricPoint = {
  rankId: Rank["id"]
  label: string
  averageWinRate: number | null
  weightedAverageWinRate: number | null
  weightCoverage: number | null
  usage: number | null
}
const getCharacterMetric = (
  entry: MetricEntry,
  characterId: CharacterId,
  playerControl: PlayerControl,
): CharacterMetricRow => {
  const current = getCharacterAverageWinRate(
    { combined: entry.block, controls: entry.controlBlocks },
    { selected: entry.usage, controls: entry.usageControls },
    characterId,
    playerControl,
  )
  const summary =
    current.summary ?? getAverageWinRateSummary(entry.block, "combined", characterId, entry.usage)
  return {
    characterId,
    averageWinRate: current.averageWinRate,
    weightedAverageWinRate: current.weightedAverageWinRate,
    usage: getUsageRate(entry.usage, characterId),
    averageWinRateDelta: null,
    weightedAverageWinRateDelta: null,
    usageDelta: null,
    debut: false,
    floor: summary.floor,
    favorableCount: summary.favorableCount,
    availableCount: summary.availableCount,
    possibleCount: summary.possibleCount,
    weightCoverage: summary.weightCoverage,
    topThreeLift: summary.topThreeLift,
  }
}

const getRosterMetrics = (
  current: MetricEntry,
  previous: MetricEntry | null,
  playerControl: PlayerControl,
  characterIds: readonly CharacterId[] = CHARACTERS.map((character) => character.id),
): CharacterMetricRow[] =>
  characterIds
    .map((characterId) => {
      const row = getCharacterMetric(current, characterId, playerControl)
      if (previous === null) {
        return row
      }
      const before = getCharacterMetric(previous, characterId, playerControl)
      return {
        ...row,
        averageWinRateDelta:
          before.averageWinRate === null || row.averageWinRate === null
            ? null
            : row.averageWinRate - before.averageWinRate,
        weightedAverageWinRateDelta:
          before.weightedAverageWinRate === null || row.weightedAverageWinRate === null
            ? null
            : row.weightedAverageWinRate - before.weightedAverageWinRate,
        usageDelta: getUsageDelta(previous.usage, current.usage, characterId).delta,
        debut: before.usage === null && row.usage !== null,
      }
    })
    .toSorted(
      (left, right) =>
        (right.averageWinRate ?? -Infinity) - (left.averageWinRate ?? -Infinity) ||
        left.characterId.localeCompare(right.characterId),
    )

const getLandscapePoint = (entry: MetricEntry, playerControl: PlayerControl): LandscapePoint => {
  const rows = getRosterMetrics(entry, null, playerControl)
  const averageWinRates = rows.flatMap((row) =>
    row.averageWinRate === null ? [] : [row.averageWinRate],
  )
  const usageStats = getUsageStats(entry.usage)
  return {
    period: entry.period,
    averageWinRateSpread:
      averageWinRates.length === 0
        ? null
        : Math.max(...averageWinRates) - Math.min(...averageWinRates),
    topFiveShare: usageStats.topFiveShare,
  }
}

const getLandscapeSeries = (
  entries: readonly MetricEntry[],
  playerControl: PlayerControl,
): LandscapePoint[] =>
  entries
    .toSorted((left, right) => left.period.localeCompare(right.period))
    .map((entry) => getLandscapePoint(entry, playerControl))

const getRankLandscapeSeries = (
  entries: readonly { rank: Rank; entry: MetricEntry }[],
  playerControl: PlayerControl,
): RankLandscapePoint[] =>
  entries.map(({ rank, entry }) => {
    const point = getLandscapePoint(entry, playerControl)
    return {
      rankId: rank.id,
      label: rank.label,
      averageWinRateSpread: point.averageWinRateSpread,
      topFiveShare: point.topFiveShare,
    }
  })

const getRankMetric = (
  entries: readonly { rank: Rank; entry: MetricEntry }[],
  characterId: CharacterId,
  playerControl: PlayerControl,
): RankMetricPoint[] =>
  entries.map(({ rank, entry }) => {
    const row = getCharacterMetric(entry, characterId, playerControl)
    return {
      rankId: rank.id,
      label: rank.label,
      averageWinRate: row.averageWinRate,
      weightedAverageWinRate: row.weightedAverageWinRate,
      weightCoverage: row.weightCoverage,
      usage: row.usage,
    }
  })

const getCharacterIds = (entries: readonly MetricEntry[]): CharacterId[] => [
  ...new Set(entries.flatMap((entry) => entry.usage.rows.map((row) => row.characterId))),
]

const getRosterTimeConsistency = (entries: readonly MetricEntry[], playerControl: PlayerControl) =>
  getCharacterIds(entries)
    .map((characterId) => {
      const stability = getTimeStability(
        entries.map((entry) => {
          return {
            period: entry.period,
            value: getCharacterMetric(entry, characterId, playerControl).averageWinRate,
          }
        }),
      )
      return {
        characterId,
        firstPeriod: stability.firstPeriod,
        lastPeriod: stability.lastPeriod,
        peakPeriod: stability.peakPeriod,
        troughPeriod: stability.troughPeriod,
        winRateRange: stability.range,
        winRateStandardDeviation: stability.standardDeviation,
        largestAdjacentChange: stability.largestAdjacentChange,
      }
    })
    .toSorted(
      (left, right) =>
        (left.winRateStandardDeviation ?? Infinity) -
          (right.winRateStandardDeviation ?? Infinity) ||
        left.characterId.localeCompare(right.characterId),
    )

const getRosterRankConsistency = (
  entries: readonly { rank: Rank; entry: MetricEntry }[],
  playerControl: PlayerControl,
) => {
  const characterIds = getCharacterIds(entries.map(({ entry }) => entry))
  return characterIds
    .map((characterId) => {
      const stability = getRankStability(
        entries.map(({ rank, entry }) => {
          return {
            rankId: rank.id,
            value: getCharacterMetric(entry, characterId, playerControl).averageWinRate,
          }
        }),
      )
      return {
        characterId,
        winRateRange: stability.range,
        peakRankId: stability.peakRankId,
        troughRankId: stability.troughRankId,
      }
    })
    .toSorted(
      (left, right) =>
        (left.winRateRange ?? Infinity) - (right.winRateRange ?? Infinity) ||
        left.characterId.localeCompare(right.characterId),
    )
}

export {
  getCharacterMetric,
  getLandscapeSeries,
  getRankMetric,
  getRankLandscapeSeries,
  getRosterRankConsistency,
  getRosterMetrics,
  getRosterTimeConsistency,
  type CharacterMetricRow,
  type LandscapePoint,
  type MetricEntry,
  type RankLandscapePoint,
  type RankMetricPoint,
}
