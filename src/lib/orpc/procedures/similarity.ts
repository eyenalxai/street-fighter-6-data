import { os } from "@orpc/server"
import * as z from "zod"

import { getMatchupClusters } from "@/lib/sf6/analytics/clustering"
import { getSimilarCharacters } from "@/lib/sf6/analytics/similarity"
import { CharacterIdSchema } from "@/lib/sf6/model"
import { getSnapshot } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"
import { AnalyticsInputSchema } from "./shared"

const SimilarityInputSchema = AnalyticsInputSchema.extend({
  character: CharacterIdSchema,
  clusterCount: z.number().int().min(3).max(5),
})
const SimilarityRowSchema = z.object({
  characterId: CharacterIdSchema,
  similarity: z.number().min(-1).max(1),
})
const SimilarityOutputSchema = z.object({
  clusters: z
    .object({
      id: z.number().int().nonnegative(),
      members: CharacterIdSchema.array(),
    })
    .array(),
  similar: SimilarityRowSchema.array(),
  different: SimilarityRowSchema.array(),
})

const similarityProcedure = os
  .input(SimilarityInputSchema)
  .output(SimilarityOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const snapshot = await getSnapshot(input.period)
      const similar = getSimilarCharacters(snapshot, input.league, input.controls, input.character)
      return {
        clusters: getMatchupClusters(snapshot, input.league, input.controls, input.clusterCount),
        similar: similar.slice(0, 5),
        different: similar.toReversed().slice(0, 5),
      }
    }),
  )

export { similarityProcedure }
