import { os } from "@orpc/server"
import * as z from "zod"

import { getAvailableCharacterIds } from "@/lib/sf6/analytics/matchups"
import {
  CharacterSchema,
  CHARACTERS,
  ControlMatchupOptionSchema,
  CONTROL_MATCHUPS,
  ReportingPeriodSchema,
} from "@/lib/sf6/model"
import { sortCharactersByName } from "@/lib/sf6/presentation"
import { RankSchema, RANKS } from "@/lib/sf6/ranks"
import { getRegularPeriods, getRankBlock, getSubdivisionPeriods } from "@/lib/sf6/snapshots.server"

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
      const periods = await getRegularPeriods()
      const subdivisionPeriods = await getSubdivisionPeriods()
      const latestPeriod = periods.at(-1)
      if (latestPeriod === undefined) {
        throw new Error("No processed ranked snapshots are available")
      }

      const latestBlock = await getRankBlock(latestPeriod, "all-master", "combined")
      const currentIds = new Set(getAvailableCharacterIds(latestBlock, "combined"))
      const characters = sortCharactersByName(
        CHARACTERS.filter((character) => currentIds.has(character.id)),
      )
      return {
        latestPeriod,
        periods,
        subdivisionPeriods,
        characters,
        ranks: RANKS,
        controls: CONTROL_MATCHUPS,
      }
    }),
  )

export { metaProcedure }
