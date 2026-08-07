import type { CharacterId, ControlMatchup, LeagueId } from "@/lib/sf6/model"
import type { ProcessedDiaSnapshot } from "@/lib/sf6/snapshot-schema"

import { getAvailableCharacterIds, getMatchupCell } from "@/lib/sf6/analytics/matchups"

import { mean, round } from "./math"

type SimilarityRow = {
  characterId: CharacterId
  similarity: number
}
type Profile = Map<string, number>

const buildProfiles = (
  snapshot: ProcessedDiaSnapshot,
  league: LeagueId,
  controlMatchup: ControlMatchup,
): Map<string, Profile> => {
  const ids = getAvailableCharacterIds(snapshot, league, controlMatchup)
  const profiles = new Map<string, Profile>()
  for (const characterId of ids) {
    const profile = new Map<string, number>()
    for (const opponentId of ids) {
      if (opponentId !== characterId) {
        const cell = getMatchupCell(snapshot, league, controlMatchup, characterId, opponentId)
        if (cell.status === "numeric" && cell.winRate !== null) {
          profile.set(opponentId, cell.winRate)
        }
      }
    }
    profiles.set(characterId, profile)
  }

  const opponentValues = new Map<string, number[]>()
  for (const profile of profiles.values()) {
    for (const [opponentId, value] of profile) {
      const values = opponentValues.get(opponentId) ?? []
      values.push(value)
      opponentValues.set(opponentId, values)
    }
  }

  const residualProfiles = new Map<string, Profile>()
  for (const [characterId, profile] of profiles) {
    const residual = new Map<string, number>()
    for (const [opponentId, value] of profile) {
      const baseline = mean(opponentValues.get(opponentId) ?? []) ?? 50
      residual.set(opponentId, value - baseline)
    }
    residualProfiles.set(characterId, residual)
  }
  return residualProfiles
}

const pearson = (left: readonly number[], right: readonly number[]): number => {
  if (left.length < 2 || left.length !== right.length) {
    return 0
  }

  const leftMean = mean(left) ?? 0
  const rightMean = mean(right) ?? 0
  let numerator = 0
  let leftDistance = 0
  let rightDistance = 0
  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index]
    const rightValue = right[index]
    if (leftValue !== undefined && rightValue !== undefined) {
      const leftDelta = leftValue - leftMean
      const rightDelta = rightValue - rightMean
      numerator += leftDelta * rightDelta
      leftDistance += leftDelta ** 2
      rightDistance += rightDelta ** 2
    }
  }
  if (leftDistance === 0 || rightDistance === 0) {
    return 0
  }
  return numerator / Math.sqrt(leftDistance * rightDistance)
}

const profileSimilarity = (
  left: Profile | undefined,
  right: Profile | undefined,
  leftId: string,
  rightId: string,
): number => {
  if (left === undefined || right === undefined) {
    return 0
  }

  const shared = [...left.keys()].filter(
    (opponentId) => opponentId !== leftId && opponentId !== rightId && right.has(opponentId),
  )
  return pearson(
    shared.map((opponentId) => left.get(opponentId) ?? 0),
    shared.map((opponentId) => right.get(opponentId) ?? 0),
  )
}

const getSimilarCharacters = (
  snapshot: ProcessedDiaSnapshot,
  league: LeagueId,
  controlMatchup: ControlMatchup,
  characterId: CharacterId,
): SimilarityRow[] => {
  const profiles = buildProfiles(snapshot, league, controlMatchup)
  const target = profiles.get(characterId)
  if (target === undefined) {
    return []
  }

  return getAvailableCharacterIds(snapshot, league, controlMatchup)
    .filter((candidateId) => candidateId !== characterId)
    .map((candidateId) => {
      return {
        characterId: candidateId,
        similarity: round(
          profileSimilarity(target, profiles.get(candidateId), characterId, candidateId),
          2,
        ),
      }
    })
    .toSorted((left, right) => right.similarity - left.similarity)
}

export { buildProfiles, getSimilarCharacters, profileSimilarity, type Profile, type SimilarityRow }
