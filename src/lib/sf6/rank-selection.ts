import type { ControlMatchup, PlayerControl, ReportingPeriod } from "./model"
import type { RankId } from "./ranks"

import { isMasterSubdivisionRank } from "./ranks"

const getPeriodsForRank = (
  rank: RankId,
  regularPeriods: readonly ReportingPeriod[],
  subdivisionPeriods: readonly ReportingPeriod[],
): readonly ReportingPeriod[] =>
  isMasterSubdivisionRank(rank) ? subdivisionPeriods : regularPeriods

const getRankComparisonPeriods = (
  regularPeriods: readonly ReportingPeriod[],
  subdivisionPeriods: readonly ReportingPeriod[],
): readonly ReportingPeriod[] => {
  const subdivisionSet = new Set(subdivisionPeriods)
  return regularPeriods.filter((period) => subdivisionSet.has(period))
}

const periodIndex = (period: ReportingPeriod): number => {
  const year = Number(period.slice(0, 4))
  const month = Number(period.slice(4, 6))
  return year * 12 + month
}

const getBoundaryPeriod = (
  periods: readonly ReportingPeriod[],
  boundary: "earliest" | "latest",
): ReportingPeriod => {
  const period = boundary === "earliest" ? periods.at(0) : periods.at(-1)
  if (period === undefined) {
    throw new Error("No reporting periods are available for this rank")
  }
  return period
}

const resolveNearestPeriod = (
  requested: ReportingPeriod | undefined,
  periods: readonly ReportingPeriod[],
): ReportingPeriod => {
  const latest = periods.at(-1)
  if (latest === undefined) {
    throw new Error("No reporting periods are available for this rank")
  }
  if (requested === undefined || periods.includes(requested)) {
    return requested ?? latest
  }

  const requestedIndex = periodIndex(requested)
  return (
    periods
      .toSorted((left, right) => {
        const distance =
          Math.abs(periodIndex(left) - requestedIndex) -
          Math.abs(periodIndex(right) - requestedIndex)
        return distance === 0 ? right.localeCompare(left) : distance
      })
      .at(0) ?? latest
  )
}

const resolvePeriodWithBoundaryDefault = (
  requested: ReportingPeriod | undefined,
  periods: readonly ReportingPeriod[],
  defaultBoundary: "earliest" | "latest",
): ReportingPeriod =>
  resolveNearestPeriod(requested ?? getBoundaryPeriod(periods, defaultBoundary), periods)

const getEffectiveControls = (rank: RankId, requested: ControlMatchup): ControlMatchup =>
  isMasterSubdivisionRank(rank) ? "combined" : requested

const getEffectivePlayerControl = (rank: RankId, requested: PlayerControl): PlayerControl =>
  isMasterSubdivisionRank(rank) ? "combined" : requested

const getControlComparisonRank = (rank: RankId): RankId =>
  isMasterSubdivisionRank(rank) ? "all-master" : rank

const filterPeriodsInRange = (
  periods: readonly ReportingPeriod[],
  fromPeriod: ReportingPeriod,
  toPeriod: ReportingPeriod,
): ReportingPeriod[] => {
  const start = fromPeriod <= toPeriod ? fromPeriod : toPeriod
  const end = fromPeriod <= toPeriod ? toPeriod : fromPeriod
  return periods.filter((period) => period >= start && period <= end)
}

export {
  filterPeriodsInRange,
  getBoundaryPeriod,
  getControlComparisonRank,
  getEffectiveControls,
  getEffectivePlayerControl,
  getPeriodsForRank,
  getRankComparisonPeriods,
  resolveNearestPeriod,
  resolvePeriodWithBoundaryDefault,
}
