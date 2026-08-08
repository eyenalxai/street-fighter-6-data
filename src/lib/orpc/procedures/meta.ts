import { os } from "@orpc/server"
import * as z from "zod"

import { getAvailablePlayerCharacterIds } from "@/lib/sf6/analytics/matchups"
import {
  CharacterSchema,
  CHARACTERS,
  ControlMatchupOptionSchema,
  CONTROL_MATCHUPS,
  ReportingPeriodSchema,
} from "@/lib/sf6/model"
import { sortCharactersByName } from "@/lib/sf6/presentation"
import { RankSchema, RANKS } from "@/lib/sf6/ranks"
import { getSnapshotPeriodAvailability } from "@/lib/sf6/snapshot-periods.server"
import { getRankBlock } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"

const MetaOutputSchema = z.object({
  latestPeriod: ReportingPeriodSchema,
  periods: ReportingPeriodSchema.array(),
  subdivisionPeriods: ReportingPeriodSchema.array(),
  characters: CharacterSchema.array(),
  ranks: RankSchema.array(),
  controls: ControlMatchupOptionSchema.array(),
})

const metaProcedure = os
  .input(z.void())
  .output(MetaOutputSchema)
  .handler(async () =>
    withSnapshotErrors(async () => {
      const { latestCompletePeriod, regularPeriods, subdivisionPeriods } =
        await getSnapshotPeriodAvailability()

      const latestBlock = await getRankBlock(latestCompletePeriod, "all-master", "combined")
      const currentIds = new Set(getAvailablePlayerCharacterIds(latestBlock, "combined"))
      const characters = sortCharactersByName(
        CHARACTERS.filter((character) => currentIds.has(character.id)),
      )
      return {
        latestPeriod: latestCompletePeriod,
        periods: regularPeriods,
        subdivisionPeriods,
        characters,
        ranks: RANKS,
        controls: CONTROL_MATCHUPS,
      }
    }),
  )

export { metaProcedure }
