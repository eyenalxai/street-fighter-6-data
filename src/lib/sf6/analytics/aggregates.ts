import type { CharacterId, ControlMatchup, ReportingPeriod } from "@/lib/sf6/model"
import type { Rank } from "@/lib/sf6/ranks"
import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"

import { CHARACTERS } from "@/lib/sf6/model"

import type { ControlMatchupBlocks } from "./matchups"

import { getAvailablePlayerCharacterIds, getMatchupAverage } from "./matchups"
import { completeMean } from "./math"

type SnapshotEntry = {
  period: ReportingPeriod
  block: ProcessedDiaLeague
}
type RankEntry = {
  rank: Rank
  block: ProcessedDiaLeague
}
type TrendPoint = {
  period: ReportingPeriod
  winRate: number | null
}
type RankPoint = {
  label: string
  rankId: Rank["id"]
  winRate: number | null
}
type RankHeatmapRow = {
  characterId: CharacterId
  points: RankPoint[]
  range: number | null
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

const getAvailableAcrossBlocks = (
  blocks: readonly ProcessedDiaLeague[],
  controlMatchup: ControlMatchup,
): CharacterId[] => {
  const available = new Set<string>()
  for (const block of blocks) {
    for (const characterId of getAvailablePlayerCharacterIds(block, controlMatchup)) {
      available.add(characterId)
    }
  }
  return CHARACTERS.filter((character) => available.has(character.id)).map(
    (character) => character.id,
  )
}

const getTrend = (
  entries: readonly SnapshotEntry[],
  characterId: CharacterId,
  controlMatchup: ControlMatchup,
): TrendPoint[] =>
  entries
    .toSorted((left, right) => left.period.localeCompare(right.period))
    .map(({ period, block }) => {
      return {
        period,
        winRate: getMatchupAverage(block, controlMatchup, characterId)?.winRate ?? null,
      }
    })

const getRankProgression = (
  entries: readonly RankEntry[],
  characterId: CharacterId,
  controlMatchup: ControlMatchup,
): RankPoint[] =>
  entries.map(({ rank, block }) => {
    return {
      label: rank.label,
      rankId: rank.id,
      winRate: getMatchupAverage(block, controlMatchup, characterId)?.winRate ?? null,
    }
  })

const getRankHeatmap = (
  entries: readonly RankEntry[],
  controlMatchup: ControlMatchup,
): RankHeatmapRow[] =>
  getAvailableAcrossBlocks(
    entries.map((entry) => entry.block),
    controlMatchup,
  )
    .map((characterId) => {
      const points = getRankProgression(entries, characterId, controlMatchup)
      const values = points
        .map((point) => point.winRate)
        .filter((value): value is number => value !== null)
      const minimum = values.length > 0 ? Math.min(...values) : null
      const maximum = values.length > 0 ? Math.max(...values) : null
      return {
        characterId,
        points,
        range: minimum === null || maximum === null ? null : maximum - minimum,
      }
    })
    .toSorted((left, right) => (right.range ?? -1) - (left.range ?? -1))

const getPlayerControlAverage = (
  controlBlocks: ControlMatchupBlocks,
  characterId: CharacterId,
  playerControl: "C" | "M",
): number | null => {
  // Average both opponent control styles while holding the player's style constant.
  const matchupIds: Exclude<ControlMatchup, "combined">[] =
    playerControl === "C"
      ? ["classic-classic", "classic-modern"]
      : ["modern-classic", "modern-modern"]
  const values = matchupIds.map(
    (controlMatchup) =>
      getMatchupAverage(controlBlocks[controlMatchup], controlMatchup, characterId)?.winRate,
  )
  const average = completeMean(values)
  return average
}

const getControlComparison = (controlBlocks: ControlMatchupBlocks): ControlComparisonRow[] =>
  getAvailableAcrossBlocks(Object.values(controlBlocks), "combined")
    .map((characterId) => {
      const classic = getPlayerControlAverage(controlBlocks, characterId, "C")
      const modern = getPlayerControlAverage(controlBlocks, characterId, "M")
      return {
        characterId,
        classic,
        modern,
        delta: classic === null || modern === null ? null : modern - classic,
      }
    })
    .toSorted((left, right) => (right.delta ?? -Infinity) - (left.delta ?? -Infinity))

const getPeriodComparison = (
  before: SnapshotEntry,
  after: SnapshotEntry,
  controlMatchup: ControlMatchup,
): PeriodComparisonRow[] => {
  const available = new Set([
    ...getAvailableAcrossBlocks([before.block], controlMatchup),
    ...getAvailableAcrossBlocks([after.block], controlMatchup),
  ])

  return CHARACTERS.filter((character) => available.has(character.id))
    .map(({ id: characterId }) => {
      const beforeValue =
        getMatchupAverage(before.block, controlMatchup, characterId)?.winRate ?? null
      const afterValue =
        getMatchupAverage(after.block, controlMatchup, characterId)?.winRate ?? null
      return {
        characterId,
        before: beforeValue,
        after: afterValue,
        delta: beforeValue === null || afterValue === null ? null : afterValue - beforeValue,
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
  type RankEntry,
  type RankHeatmapRow,
  type RankPoint,
  type SnapshotEntry,
  type TrendPoint,
}
