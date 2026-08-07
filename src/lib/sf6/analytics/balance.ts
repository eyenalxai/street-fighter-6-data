import type { SnapshotEntry } from "@/lib/sf6/analytics/aggregates"
import type { MatchupSpreadRow } from "@/lib/sf6/analytics/matchups"
import type { ControlMatchup, CharacterId, LeagueId } from "@/lib/sf6/model"
import type { ProcessedDiaSnapshot } from "@/lib/sf6/snapshot-schema"

import { getTrend } from "@/lib/sf6/analytics/aggregates"
import { getAvailableCharacterIds, getMatchupSpread } from "@/lib/sf6/analytics/matchups"

import { mean, round, standardDeviation } from "./math"

type BalanceRow = {
  characterId: CharacterId
  mean: number
  min: number
  max: number
  spread: number
  standardDeviation: number
  favorable: number
  even: number
  unfavorable: number
  volatility: number
}
type BalanceSummary = {
  count: number
  balancedShare: number
  tierSpread: number
  meanStandardDeviation: number
  strongest: BalanceRow | null
  weakest: BalanceRow | null
  mostVolatile: BalanceRow | null
}

const getBalanceMetrics = (
  snapshot: ProcessedDiaSnapshot,
  entries: readonly SnapshotEntry[],
  league: LeagueId,
  controlMatchup: ControlMatchup,
): BalanceRow[] =>
  getAvailableCharacterIds(snapshot, league, controlMatchup)
    .map((characterId) => {
      const matchupRows: MatchupSpreadRow[] = getMatchupSpread(
        snapshot,
        league,
        controlMatchup,
        characterId,
      )
      const values = matchupRows.map((row) => row.winRate)
      const average = mean(values)
      if (average === null) {
        return null
      }
      const volatility = standardDeviation(
        getTrend(entries, league, characterId, controlMatchup)
          .map((point) => point.winRate)
          .filter((value): value is number => value !== null),
      )
      const minimum = Math.min(...values)
      const maximum = Math.max(...values)
      return {
        characterId,
        mean: round(average),
        min: round(minimum),
        max: round(maximum),
        spread: round(maximum - minimum),
        standardDeviation: round(standardDeviation(values)),
        favorable: values.filter((value) => value >= 53).length,
        even: values.filter((value) => value > 47 && value < 53).length,
        unfavorable: values.filter((value) => value <= 47).length,
        volatility: round(volatility),
      }
    })
    .filter((row): row is BalanceRow => row !== null)
    .toSorted((left, right) => right.mean - left.mean)

const getBalanceSummary = (rows: readonly BalanceRow[]): BalanceSummary => {
  if (rows.length === 0) {
    return {
      count: 0,
      balancedShare: 0,
      tierSpread: 0,
      meanStandardDeviation: 0,
      strongest: null,
      weakest: null,
      mostVolatile: null,
    }
  }

  const means = rows.map((row) => row.mean)
  const balancedCount = rows.filter((row) => row.mean >= 47 && row.mean <= 53).length
  const mostVolatile = rows.toSorted((left, right) => right.volatility - left.volatility)[0] ?? null
  return {
    count: rows.length,
    balancedShare: Math.round((balancedCount / rows.length) * 100),
    tierSpread: round(Math.max(...means) - Math.min(...means)),
    meanStandardDeviation: round(standardDeviation(means)),
    strongest: rows[0] ?? null,
    weakest: rows.at(-1) ?? null,
    mostVolatile,
  }
}

export { getBalanceMetrics, getBalanceSummary, type BalanceRow, type BalanceSummary }
