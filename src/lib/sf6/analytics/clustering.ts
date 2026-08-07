import type { ControlMatchup, LeagueId } from "@/lib/sf6/model"
import type { ProcessedDiaSnapshot } from "@/lib/sf6/snapshot-schema"

import { getAvailableCharacterIds } from "@/lib/sf6/analytics/matchups"
import { buildProfiles, profileSimilarity } from "@/lib/sf6/analytics/similarity"
import { CHARACTERS } from "@/lib/sf6/model"

import { mean } from "./math"

type Cluster = {
  id: number
  members: ReturnType<typeof getAvailableCharacterIds>
}
type ClusterPair = {
  left: number
  right: number
  similarity: number
}

const averageLinkage = (
  left: readonly string[],
  right: readonly string[],
  similarity: (leftId: string, rightId: string) => number,
): number => {
  const values: number[] = []
  for (const leftId of left) {
    for (const rightId of right) {
      values.push(similarity(leftId, rightId))
    }
  }
  return mean(values) ?? 0
}

const findBestPair = (
  clusters: readonly string[][],
  similarity: (leftId: string, rightId: string) => number,
): ClusterPair | undefined => {
  const pairs: ClusterPair[] = []
  for (let leftIndex = 0; leftIndex < clusters.length; leftIndex += 1) {
    const left = clusters[leftIndex] ?? []
    const rightClusters = clusters.slice(leftIndex + 1)
    for (const [offset, right] of rightClusters.entries()) {
      pairs.push({
        left: leftIndex,
        right: leftIndex + offset + 1,
        similarity: averageLinkage(left, right, similarity),
      })
    }
  }
  return pairs.toSorted((left, right) => right.similarity - left.similarity)[0]
}

const getMatchupClusters = (
  snapshot: ProcessedDiaSnapshot,
  league: LeagueId,
  controlMatchup: ControlMatchup,
  requestedCount: number,
): Cluster[] => {
  const ids = getAvailableCharacterIds(snapshot, league, controlMatchup)
  const profiles = buildProfiles(snapshot, league, controlMatchup)
  const similarities = new Map<string, number>()
  const similarity = (leftId: string, rightId: string): number => {
    const key = leftId < rightId ? `${leftId}|${rightId}` : `${rightId}|${leftId}`
    const cached = similarities.get(key)
    if (cached !== undefined) {
      return cached
    }
    const value = profileSimilarity(profiles.get(leftId), profiles.get(rightId), leftId, rightId)
    similarities.set(key, value)
    return value
  }

  let clusters = ids.map((id) => [id])
  const targetCount = Math.max(1, Math.min(requestedCount, clusters.length))
  while (clusters.length > targetCount) {
    const bestPair = findBestPair(clusters, similarity)
    if (bestPair === undefined) {
      break
    }
    const left = clusters[bestPair.left] ?? []
    const right = clusters[bestPair.right] ?? []
    clusters = [
      ...clusters.filter((_, index) => index !== bestPair.left && index !== bestPair.right),
      [...left, ...right],
    ]
  }

  return clusters
    .map((members) =>
      members.toSorted(
        (left, right) =>
          CHARACTERS.findIndex((character) => character.id === left) -
          CHARACTERS.findIndex((character) => character.id === right),
      ),
    )
    .toSorted(
      (left, right) =>
        right.length - left.length ||
        CHARACTERS.findIndex((character) => character.id === left[0]) -
          CHARACTERS.findIndex((character) => character.id === right[0]),
    )
    .map((members, id) => {
      return { id, members }
    })
}

export { getMatchupClusters, type Cluster }
