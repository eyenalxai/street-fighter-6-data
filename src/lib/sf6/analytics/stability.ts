import type { ReportingPeriod } from "@/lib/sf6/model"
import type { RankId } from "@/lib/sf6/ranks"

import { standardDeviation } from "./math"

type TimeStabilityPoint = {
  period: ReportingPeriod
  value: number | null
}

type RankStabilityPoint = {
  rankId: RankId
  value: number | null
}

const getTimeStability = (points: readonly TimeStabilityPoint[]) => {
  const chronologicalPoints = points.toSorted((left, right) =>
    left.period.localeCompare(right.period),
  )
  const values = chronologicalPoints.flatMap((point) => (point.value === null ? [] : [point.value]))
  const numericPoints = chronologicalPoints.filter(
    (point): point is { period: ReportingPeriod; value: number } => point.value !== null,
  )
  const adjacentChanges = chronologicalPoints
    .map((point, index) => {
      const previous = chronologicalPoints[index - 1]?.value
      return previous === null || previous === undefined || point.value === null
        ? null
        : Math.abs(point.value - previous)
    })
    .filter((value): value is number => value !== null)
  const peak = numericPoints.toSorted((left, right) => right.value - left.value)[0]
  const trough = numericPoints.toSorted((left, right) => left.value - right.value)[0]

  return {
    firstPeriod: numericPoints[0]?.period ?? null,
    lastPeriod: numericPoints.at(-1)?.period ?? null,
    peakPeriod: peak?.period ?? null,
    troughPeriod: trough?.period ?? null,
    range: values.length === 0 ? null : Math.max(...values) - Math.min(...values),
    standardDeviation: standardDeviation(values),
    largestAdjacentChange: adjacentChanges.length === 0 ? null : Math.max(...adjacentChanges),
  }
}

const getRankStability = (points: readonly RankStabilityPoint[]) => {
  const numericPoints = points.filter(
    (point): point is { rankId: RankId; value: number } => point.value !== null,
  )
  const values = numericPoints.map((point) => point.value)
  const peak = numericPoints.toSorted((left, right) => right.value - left.value)[0]
  const trough = numericPoints.toSorted((left, right) => left.value - right.value)[0]

  return {
    peakRankId: peak?.rankId ?? null,
    troughRankId: trough?.rankId ?? null,
    range: values.length === 0 ? null : Math.max(...values) - Math.min(...values),
  }
}

export { getRankStability, getTimeStability, type RankStabilityPoint, type TimeStabilityPoint }
