import type { CharacterId, PlayerControl, ReportingPeriod } from "@/lib/sf6/model"
import type { UsageBlock, UsageCharacterRow } from "@/lib/sf6/snapshots/usage.server"

import { standardDeviation } from "./math"

type UsagePoint = {
  period: ReportingPeriod
  playRate: number | null
}
type UsageStats = {
  totalShare: number
  effectiveRosterSize: number | null
  topFiveShare: number
  characterCount: number
}
type UsageDelta = {
  before: number | null
  after: number | null
  delta: number | null
}

const getUsageRate = (block: UsageBlock, characterId: CharacterId): number | null =>
  block.rows.find((row) => row.characterId === characterId)?.playRate ?? null

const getUsageStats = (block: UsageBlock): UsageStats => {
  const rows = block.rows.toSorted((left, right) => right.playRate - left.playRate)
  const totalShare = rows.reduce((sum, row) => sum + row.playRate, 0)
  const probabilities = rows
    .filter((row) => row.playRate > 0)
    .map((row) => row.playRate / totalShare)
  const entropy = probabilities.reduce(
    (sum, probability) => sum - probability * Math.log(probability),
    0,
  )
  return {
    totalShare,
    effectiveRosterSize: totalShare === 0 ? null : Math.exp(entropy),
    topFiveShare:
      totalShare === 0
        ? 0
        : (rows.slice(0, 5).reduce((sum, row) => sum + row.playRate, 0) / totalShare) * 100,
    characterCount: rows.length,
  }
}

const getUsageDelta = (
  before: UsageBlock | null,
  after: UsageBlock | null,
  characterId: CharacterId,
): UsageDelta => {
  const beforeValue = before === null ? null : getUsageRate(before, characterId)
  const afterValue = after === null ? null : getUsageRate(after, characterId)
  return {
    before: beforeValue,
    after: afterValue,
    delta: beforeValue === null || afterValue === null ? null : afterValue - beforeValue,
  }
}

const getUsageSeries = (
  entries: readonly { period: ReportingPeriod; block: UsageBlock }[],
  characterId: CharacterId,
): UsagePoint[] =>
  entries
    .toSorted((left, right) => left.period.localeCompare(right.period))
    .map(({ period, block }) => {
      return { period, playRate: getUsageRate(block, characterId) }
    })

const getUsageStability = (points: readonly UsagePoint[]) => {
  const values = points.flatMap((point) => (point.playRate === null ? [] : [point.playRate]))
  const first = points.find((point) => point.playRate !== null)?.period ?? null
  const last = points.toReversed().find((point) => point.playRate !== null)?.period ?? null
  const adjacentChanges = points
    .map((point, index) => {
      const previous = points[index - 1]?.playRate
      return previous === null || previous === undefined || point.playRate === null
        ? null
        : Math.abs(point.playRate - previous)
    })
    .filter((value): value is number => value !== null)
  return {
    firstPeriod: first,
    lastPeriod: last,
    range: values.length === 0 ? null : Math.max(...values) - Math.min(...values),
    standardDeviation: standardDeviation(values),
    largestAdjacentChange: adjacentChanges.length === 0 ? null : Math.max(...adjacentChanges),
  }
}

const sortUsageRows = (rows: readonly UsageCharacterRow[]) =>
  rows.toSorted((left, right) => right.playRate - left.playRate)

const playerControlLabel = (control: PlayerControl): string =>
  control === "combined" ? "All control styles" : control === "classic" ? "Classic" : "Modern"

export {
  getUsageDelta,
  getUsageRate,
  getUsageSeries,
  getUsageStability,
  getUsageStats,
  playerControlLabel,
  sortUsageRows,
  type UsageDelta,
  type UsagePoint,
  type UsageStats,
}
