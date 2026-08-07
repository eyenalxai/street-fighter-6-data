import type { CharacterId, ControlMatchup, LeagueId, ReportingPeriod } from "@/lib/sf6/model"
import type { ProcessedDiaSnapshot } from "@/lib/sf6/snapshot-schema"

import { CHARACTERS, LEAGUES } from "@/lib/sf6/model"

import { getAvailableCharacterIds, getMatchupAverage } from "./matchups"
import { mean, round } from "./math"

type SnapshotEntry = {
  period: ReportingPeriod
  snapshot: ProcessedDiaSnapshot
}
type TrendPoint = {
  period: ReportingPeriod
  winRate: number | null
}
type RankPoint = {
  label: string
  leagueId: LeagueId
  winRate: number | null
}
type RankHeatmapRow = {
  characterId: CharacterId
  points: RankPoint[]
  spread: number | null
}
type ControlComparisonRow = {
  characterId: CharacterId
  classic: number | null
  modern: number | null
  delta: number | null
}
type PeriodComparisonRow = {
  characterId: CharacterId
  before: number | null
  after: number | null
  delta: number | null
}

const getAvailableAcrossLeagues = (
  snapshot: ProcessedDiaSnapshot,
  controlMatchup: ControlMatchup,
): CharacterId[] => {
  const available = new Set<string>()
  for (const league of LEAGUES) {
    for (const characterId of getAvailableCharacterIds(snapshot, league.id, controlMatchup)) {
      available.add(characterId)
    }
  }
  return CHARACTERS.filter((character) => available.has(character.id)).map(
    (character) => character.id,
  )
}

const getTrend = (
  entries: readonly SnapshotEntry[],
  league: LeagueId,
  characterId: CharacterId,
  controlMatchup: ControlMatchup,
): TrendPoint[] =>
  entries
    .toSorted((left, right) => left.period.localeCompare(right.period))
    .map(({ period, snapshot }) => {
      return {
        period,
        winRate: getMatchupAverage(snapshot, league, controlMatchup, characterId)?.winRate ?? null,
      }
    })

const getRankProgression = (
  snapshot: ProcessedDiaSnapshot,
  characterId: CharacterId,
  controlMatchup: ControlMatchup,
): RankPoint[] =>
  LEAGUES.map((league) => {
    return {
      label: league.label,
      leagueId: league.id,
      winRate: getMatchupAverage(snapshot, league.id, controlMatchup, characterId)?.winRate ?? null,
    }
  })

const getRankHeatmap = (
  snapshot: ProcessedDiaSnapshot,
  controlMatchup: ControlMatchup,
): RankHeatmapRow[] =>
  getAvailableAcrossLeagues(snapshot, controlMatchup)
    .map((characterId) => {
      const points = getRankProgression(snapshot, characterId, controlMatchup)
      const values = points
        .map((point) => point.winRate)
        .filter((value): value is number => value !== null)
      const minimum = values.length > 0 ? Math.min(...values) : null
      const maximum = values.length > 0 ? Math.max(...values) : null
      return {
        characterId,
        points,
        spread: minimum === null || maximum === null ? null : round(maximum - minimum),
      }
    })
    .toSorted((left, right) => (right.spread ?? -1) - (left.spread ?? -1))

const getBalancedControlAverage = (
  snapshot: ProcessedDiaSnapshot,
  league: LeagueId,
  characterId: CharacterId,
  playerControl: "C" | "M",
): number | null => {
  const matchupIds: ControlMatchup[] =
    playerControl === "C"
      ? ["classic-classic", "classic-modern"]
      : ["modern-classic", "modern-modern"]
  const values = matchupIds
    .map(
      (controlMatchup) => getMatchupAverage(snapshot, league, controlMatchup, characterId)?.winRate,
    )
    .filter((value): value is number => value !== undefined && value !== null)
  const average = mean(values)
  return average === null ? null : round(average)
}

const getControlComparison = (
  snapshot: ProcessedDiaSnapshot,
  league: LeagueId,
): ControlComparisonRow[] =>
  getAvailableAcrossLeagues(snapshot, "combined")
    .map((characterId) => {
      const classic = getBalancedControlAverage(snapshot, league, characterId, "C")
      const modern = getBalancedControlAverage(snapshot, league, characterId, "M")
      return {
        characterId,
        classic,
        modern,
        delta: classic === null || modern === null ? null : round(modern - classic),
      }
    })
    .toSorted((left, right) => (right.delta ?? -Infinity) - (left.delta ?? -Infinity))

const getPeriodComparison = (
  before: SnapshotEntry,
  after: SnapshotEntry,
  league: LeagueId,
  controlMatchup: ControlMatchup,
): PeriodComparisonRow[] => {
  const available = new Set([
    ...getAvailableAcrossLeagues(before.snapshot, controlMatchup),
    ...getAvailableAcrossLeagues(after.snapshot, controlMatchup),
  ])

  return CHARACTERS.filter((character) => available.has(character.id))
    .map(({ id: characterId }) => {
      const beforeValue =
        getMatchupAverage(before.snapshot, league, controlMatchup, characterId)?.winRate ?? null
      const afterValue =
        getMatchupAverage(after.snapshot, league, controlMatchup, characterId)?.winRate ?? null
      return {
        characterId,
        before: beforeValue,
        after: afterValue,
        delta: beforeValue === null || afterValue === null ? null : round(afterValue - beforeValue),
      }
    })
    .toSorted((left, right) => (right.delta ?? -Infinity) - (left.delta ?? -Infinity))
}

export {
  getControlComparison,
  getPeriodComparison,
  getRankHeatmap,
  getRankProgression,
  getTrend,
  type ControlComparisonRow,
  type PeriodComparisonRow,
  type RankHeatmapRow,
  type RankPoint,
  type SnapshotEntry,
  type TrendPoint,
}
