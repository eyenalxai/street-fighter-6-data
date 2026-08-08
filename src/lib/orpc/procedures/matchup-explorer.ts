import { os } from "@orpc/server"
import * as z from "zod"

import { getMatchupCell, getControlPair } from "@/lib/sf6/analytics/matchup-cells"
import {
  getMatchupProfile,
  getPairProgression,
  getPairTrend,
  getSimilarProfiles,
} from "@/lib/sf6/analytics/profiles"
import {
  CharacterIdSchema,
  ControlMatchupSchema,
  CONTROL_MATCHUPS,
  ReportingPeriodSchema,
} from "@/lib/sf6/model"
import { getEffectiveControls, getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank, RankIdSchema, RANKS } from "@/lib/sf6/ranks"
import { getSnapshotPeriodAvailability } from "@/lib/sf6/snapshot-periods.server"
import { getRankBlock, getRankControlBlocks } from "@/lib/sf6/snapshots/dia.server"
import { getUsageBlock, getUsageCharacter } from "@/lib/sf6/snapshots/usage.server"

import { withSnapshotErrors } from "./execute.server"

const MatchupExplorerInputSchema = z.object({
  period: ReportingPeriodSchema,
  rank: RankIdSchema,
  controls: ControlMatchupSchema,
  character: CharacterIdSchema,
  opponent: CharacterIdSchema,
})
const CellSchema = z.object({
  playerId: CharacterIdSchema,
  opponentId: CharacterIdSchema,
  status: z.enum(["numeric", "unavailable", "mirror"]),
  winRate: z.number().min(0).max(100).nullable(),
})
const ProfileRowSchema = z.object({
  opponentId: CharacterIdSchema,
  status: z.enum(["numeric", "unavailable", "mirror"]),
  winRate: z.number().min(0).max(100).nullable(),
  opponentUsage: z.number().min(0).max(100).nullable(),
  weightedDisadvantageContribution: z.number().min(0).max(50).nullable(),
})
const SummarySchema = z.object({
  unweightedAverage: z.number().min(0).max(100).nullable(),
  weightedAverage: z.number().min(0).max(100).nullable(),
  weightCoverage: z.number().min(0).max(1).nullable(),
  floor: z.number().min(0).max(100).nullable(),
  favorableCount: z.number().int().nonnegative(),
  availableCount: z.number().int().nonnegative(),
  possibleCount: z.number().int().nonnegative(),
  coverage: z.number().min(0).max(1).nullable(),
  topThreeLift: z.number().min(-100).max(100).nullable(),
  matchupImbalance: z.number().min(0).max(50).nullable(),
})
const ProgressionSchema = z
  .object({
    label: z.string(),
    id: z.string(),
    winRate: z.number().min(0).max(100).nullable(),
  })
  .array()
const MatchupExplorerOutputSchema = z.object({
  headToHead: CellSchema,
  playerUsage: z.number().min(0).max(100).nullable(),
  opponentUsage: z.number().min(0).max(100).nullable(),
  controlMatchups: z
    .object({
      controlMatchup: ControlMatchupSchema.exclude(["combined"]),
      label: z.string(),
      winRate: z.number().min(0).max(100).nullable(),
    })
    .array(),
  profile: ProfileRowSchema.array(),
  summary: SummarySchema,
  rankProgression: ProgressionSchema,
  timeProgression: z
    .object({
      period: ReportingPeriodSchema,
      label: z.string(),
      id: z.string(),
      winRate: z.number().min(0).max(100).nullable(),
    })
    .array(),
  similarProfiles: z
    .object({
      characterId: CharacterIdSchema,
      correlation: z.number().min(-1).max(1),
      overlap: z.number().int().nonnegative(),
    })
    .array(),
})

const playerControlForMatchup = (controls: z.infer<typeof ControlMatchupSchema>) =>
  getControlPair(controls).player === null
    ? ("combined" as const)
    : getControlPair(controls).player === "C"
      ? ("classic" as const)
      : ("modern" as const)
const opponentControlForMatchup = (controls: z.infer<typeof ControlMatchupSchema>) =>
  getControlPair(controls).opponent === null
    ? ("combined" as const)
    : getControlPair(controls).opponent === "C"
      ? ("classic" as const)
      : ("modern" as const)

const matchupExplorerProcedure = os
  .input(MatchupExplorerInputSchema)
  .output(MatchupExplorerOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const controls = getEffectiveControls(input.rank, input.controls)
      const [block, controlBlocks, playerUsageBlock, opponentUsageBlock, availability] =
        await Promise.all([
          getRankBlock(input.period, input.rank, controls),
          getRankControlBlocks(input.period, input.rank),
          getUsageBlock(input.period, input.rank, playerControlForMatchup(controls)),
          getUsageBlock(input.period, input.rank, opponentControlForMatchup(controls)),
          getSnapshotPeriodAvailability(),
        ])
      const profile = getMatchupProfile(block, controls, input.character, opponentUsageBlock)
      const pair = getMatchupCell(block, controls, input.character, input.opponent)
      const controlMatchups =
        controlBlocks === null
          ? []
          : CONTROL_MATCHUPS.flatMap((control) =>
              control.id === "combined"
                ? []
                : [
                    {
                      controlMatchup: control.id,
                      label: control.label,
                      winRate: getMatchupCell(
                        controlBlocks[control.id],
                        control.id,
                        input.character,
                        input.opponent,
                      ).winRate,
                    },
                  ],
            )
      const periods = getPeriodsForRank(
        input.rank,
        availability.regularPeriods,
        availability.subdivisionPeriods,
      )
      const timeEntries = await Promise.all(
        periods.map(async (period) => {
          return {
            period,
            block: await getRankBlock(period, input.rank, controls),
          }
        }),
      )
      const ranks = RANKS.filter(
        (rank) =>
          !isMasterSubdivisionRank(rank.id) ||
          availability.subdivisionPeriods.includes(input.period),
      )
      const rankEntries = await Promise.all(
        ranks.map(async (rank) => {
          return {
            rank,
            block: await getRankBlock(input.period, rank.id, "combined"),
          }
        }),
      )
      const playerUsage = getUsageCharacter(playerUsageBlock, input.character)?.playRate ?? null
      const opponentUsage = getUsageCharacter(opponentUsageBlock, input.opponent)?.playRate ?? null
      return {
        headToHead: pair,
        playerUsage,
        opponentUsage,
        controlMatchups,
        profile: profile.rows,
        summary: profile.summary,
        rankProgression: getPairProgression(rankEntries, input.character, input.opponent),
        timeProgression: getPairTrend(timeEntries, input.character, input.opponent, controls),
        similarProfiles: getSimilarProfiles(block, controls, input.character).slice(0, 8),
      }
    }),
  )

export { matchupExplorerProcedure }
