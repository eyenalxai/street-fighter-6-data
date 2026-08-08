import type { CharacterId, PlayerControl, ReportingPeriod } from "@/lib/sf6/model"
import type { Rank, RankId } from "@/lib/sf6/ranks"
import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"
import type { ControlBlocks } from "@/lib/sf6/snapshots/dia.server"
import type { UsageBlock } from "@/lib/sf6/snapshots/usage.server"

import { CHARACTERS } from "@/lib/sf6/model"

import { getCharacterPerformance, getPerformanceSummary } from "./performance"
import { getUsageDelta, getUsageRate, getUsageStats, getUsageStability } from "./usage"

type MetricEntry = {
  period: ReportingPeriod
  block: ProcessedDiaLeague
  controlBlocks: ControlBlocks | null
  usage: UsageBlock
  usageControls?: Record<Exclude<PlayerControl, "combined">, UsageBlock>
}
type CharacterMetricRow = {
  characterId: CharacterId
  performance: number | null
  weightedPerformance: number | null
  usage: number | null
  performanceDelta: number | null
  weightedPerformanceDelta: number | null
  usageDelta: number | null
  debut: boolean
  floor: number | null
  favorableCount: number
  availableCount: number
  possibleCount: number
  coverage: number | null
  weightCoverage: number | null
  topThreeLift: number | null
}
type LandscapePoint = {
  period: ReportingPeriod
  performanceSpread: number | null
  effectiveRosterSize: number | null
  topFiveShare: number
}
type RankLandscapePoint = {
  rankId: Rank["id"]
  label: string
  performanceSpread: number | null
  effectiveRosterSize: number | null
  topFiveShare: number
}
type RankMetricPoint = {
  rankId: Rank["id"]
  label: string
  performance: number | null
  weightedPerformance: number | null
  weightCoverage: number | null
  usage: number | null
}
type ChangeSummary = {
  performanceSpread: number | null
  effectiveRosterSize: number | null
  topFiveShare: number
  matchupImbalance: number | null
}
type MatchupChangeRow = {
  characterId: CharacterId
  opponentId: CharacterId
  before: number
  after: number
  delta: number
  flip: boolean
}

const getCharacterMetric = (
  entry: MetricEntry,
  characterId: CharacterId,
  playerControl: PlayerControl,
): CharacterMetricRow => {
  const current = getCharacterPerformance(
    { combined: entry.block, controls: entry.controlBlocks },
    { selected: entry.usage, controls: entry.usageControls },
    characterId,
    playerControl,
  )
  const summary =
    current.summary ?? getPerformanceSummary(entry.block, "combined", characterId, entry.usage)
  return {
    characterId,
    performance: current.performance,
    weightedPerformance: current.weightedPerformance,
    usage: getUsageRate(entry.usage, characterId),
    performanceDelta: null,
    weightedPerformanceDelta: null,
    usageDelta: null,
    debut: false,
    floor: summary.floor,
    favorableCount: summary.favorableCount,
    availableCount: summary.availableCount,
    possibleCount: summary.possibleCount,
    coverage: summary.coverage,
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
        performanceDelta:
          before.performance === null || row.performance === null
            ? null
            : row.performance - before.performance,
        weightedPerformanceDelta:
          before.weightedPerformance === null || row.weightedPerformance === null
            ? null
            : row.weightedPerformance - before.weightedPerformance,
        usageDelta: getUsageDelta(previous.usage, current.usage, characterId).delta,
        debut: before.usage === null && row.usage !== null,
      }
    })
    .toSorted(
      (left, right) =>
        (right.performance ?? -Infinity) - (left.performance ?? -Infinity) ||
        left.characterId.localeCompare(right.characterId),
    )

const getLandscapePoint = (entry: MetricEntry, playerControl: PlayerControl): LandscapePoint => {
  const rows = getRosterMetrics(entry, null, playerControl)
  const performances = rows.flatMap((row) => (row.performance === null ? [] : [row.performance]))
  const usageStats = getUsageStats(entry.usage)
  return {
    period: entry.period,
    performanceSpread:
      performances.length === 0 ? null : Math.max(...performances) - Math.min(...performances),
    effectiveRosterSize: usageStats.effectiveRosterSize,
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
      performanceSpread: point.performanceSpread,
      effectiveRosterSize: point.effectiveRosterSize,
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
      performance: row.performance,
      weightedPerformance: row.weightedPerformance,
      weightCoverage: row.weightCoverage,
      usage: row.usage,
    }
  })

const getCharacterStability = (
  points: readonly { period: ReportingPeriod; performance: number | null }[],
  rankPoints: readonly { rankId?: RankId; performance: number | null }[],
) => {
  const time = getUsageStability(
    points.map(({ period, performance }) => {
      return { period, playRate: performance }
    }),
  )
  const rankValues = rankPoints.flatMap((point) =>
    point.performance === null ? [] : [point.performance],
  )
  const numericTime = points.filter(
    (point): point is { period: ReportingPeriod; performance: number } =>
      point.performance !== null,
  )
  const numericRanks = rankPoints.filter(
    (point): point is { rankId: RankId; performance: number } =>
      point.rankId !== undefined && point.performance !== null,
  )
  const peakTime = numericTime.toSorted((left, right) => right.performance - left.performance)[0]
  const troughTime = numericTime.toSorted((left, right) => left.performance - right.performance)[0]
  const peakRank = numericRanks.toSorted((left, right) => right.performance - left.performance)[0]
  const troughRank = numericRanks.toSorted((left, right) => left.performance - right.performance)[0]
  return {
    firstPeriod: time.firstPeriod,
    lastPeriod: time.lastPeriod,
    peakPeriod: peakTime?.period ?? null,
    troughPeriod: troughTime?.period ?? null,
    peakRankId: peakRank?.rankId ?? null,
    troughRankId: troughRank?.rankId ?? null,
    timeRange: time.range,
    timeStandardDeviation: time.standardDeviation,
    largestAdjacentChange: time.largestAdjacentChange,
    rankRange: rankValues.length === 0 ? null : Math.max(...rankValues) - Math.min(...rankValues),
  }
}

const getChangeSummary = (entry: MetricEntry, playerControl: PlayerControl): ChangeSummary => {
  const rows = getRosterMetrics(entry, null, playerControl)
  const performances = rows.flatMap((row) => (row.performance === null ? [] : [row.performance]))
  const matchupValues = rows.flatMap((row) => {
    const summary = getPerformanceSummary(entry.block, "combined", row.characterId, entry.usage)
    return summary.matchupImbalance === null ? [] : [summary.matchupImbalance]
  })
  return {
    performanceSpread:
      performances.length === 0 ? null : Math.max(...performances) - Math.min(...performances),
    effectiveRosterSize: getUsageStats(entry.usage).effectiveRosterSize,
    topFiveShare: getUsageStats(entry.usage).topFiveShare,
    matchupImbalance:
      matchupValues.length === 0
        ? null
        : matchupValues.reduce((sum, value) => sum + value, 0) / matchupValues.length,
  }
}

export {
  getCharacterMetric,
  getCharacterStability,
  getChangeSummary,
  getLandscapeSeries,
  getRankMetric,
  getRankLandscapeSeries,
  getRosterMetrics,
  type CharacterMetricRow,
  type ChangeSummary,
  type LandscapePoint,
  type MatchupChangeRow,
  type MetricEntry,
  type RankLandscapePoint,
  type RankMetricPoint,
}
