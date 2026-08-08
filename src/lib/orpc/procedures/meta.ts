import { os } from "@orpc/server"
import * as z from "zod"

import { getAvailableCharacterIds } from "@/lib/sf6/analytics/matchups"
import {
  CharacterSchema,
  CHARACTERS,
  ControlMatchupOptionSchema,
  CONTROL_MATCHUPS,
  LeagueSchema,
  LEAGUES,
  ReportingPeriodSchema,
} from "@/lib/sf6/model"
import { sortCharactersByName } from "@/lib/sf6/presentation"
import { getAvailablePeriods, getSnapshot } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"

const MetaOutputSchema = z.object({
  latestPeriod: ReportingPeriodSchema,
  periods: ReportingPeriodSchema.array(),
  characters: CharacterSchema.array(),
  leagues: LeagueSchema.array(),
  controls: ControlMatchupOptionSchema.array(),
})

const metaProcedure = os
  .input(z.void())
  .output(MetaOutputSchema)
  .handler(async () =>
    withSnapshotErrors(async () => {
      const periods = await getAvailablePeriods()
      const latestPeriod = periods.at(-1)
      if (latestPeriod === undefined) {
        throw new Error("No processed ranked snapshots are available")
      }

      const latestSnapshot = await getSnapshot(latestPeriod)
      const currentIds = new Set(getAvailableCharacterIds(latestSnapshot, "8", "combined"))
      const characters = sortCharactersByName(
        CHARACTERS.filter((character) => currentIds.has(character.id)),
      )
      return {
        latestPeriod,
        periods,
        characters,
        leagues: LEAGUES,
        controls: CONTROL_MATCHUPS,
      }
    }),
  )

export { metaProcedure }
