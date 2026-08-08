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

const MatchupExplorerInputSchema = z.discriminatedUnion("view", [
  z.object({
    view: z.literal("head-to-head"),
    period: ReportingPeriodSchema,
    rank: RankIdSchema,
    controls: ControlMatchupSchema,
    character: CharacterIdSchema,
    opponent: CharacterIdSchema,
  }),
  z.object({
    view: z.literal("profile"),
    period: ReportingPeriodSchema,
    rank: RankIdSchema,
    controls: ControlMatchupSchema,
    character: CharacterIdSchema,
  }),
  z.object({
    view: z.literal("ranks"),
    period: ReportingPeriodSchema,
    character: CharacterIdSchema,
    opponent: CharacterIdSchema,
  }),
  z.object({
    view: z.literal("time"),
    rank: RankIdSchema,
    controls: ControlMatchupSchema,
    character: CharacterIdSchema,
    opponent: CharacterIdSchema,
  }),
])
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
  topThreeLift: z.number().min(-100).max(100).nullable(),
  matchupImbalance: z.number().min(0).max(50).nullable(),
})
const ControlMatchupResultSchema = z
  .object({
    controlMatchup: ControlMatchupSchema.exclude(["combined"]),
    label: z.string(),
    winRate: z.number().min(0).max(100).nullable(),
  })
  .array()
const ProgressionSchema = z
  .object({
    label: z.string(),
    id: z.string(),
    winRate: z.number().min(0).max(100).nullable(),
  })
  .array()
const HeadToHeadOutputSchema = z.object({
  view: z.literal("head-to-head"),
  headToHead: CellSchema,
  playerUsage: z.number().min(0).max(100).nullable(),
  opponentUsage: z.number().min(0).max(100).nullable(),
  controlMatchups: ControlMatchupResultSchema,
})
const ProfileOutputSchema = z.object({
  view: z.literal("profile"),
  profile: ProfileRowSchema.array(),
  summary: SummarySchema,
  similarProfiles: z
    .object({
      characterId: CharacterIdSchema,
      correlation: z.number().min(-1).max(1),
      overlap: z.number().int().nonnegative(),
    })
    .array(),
})
const RanksOutputSchema = z.object({
  view: z.literal("ranks"),
  rankProgression: ProgressionSchema,
})
const TimeOutputSchema = z.object({
  view: z.literal("time"),
  timeProgression: z
    .object({
      period: ReportingPeriodSchema,
      label: z.string(),
      id: z.string(),
      winRate: z.number().min(0).max(100).nullable(),
    })
    .array(),
})
const MatchupExplorerOutputSchema = z.discriminatedUnion("view", [
  HeadToHeadOutputSchema,
  ProfileOutputSchema,
  RanksOutputSchema,
  TimeOutputSchema,
])

const playerControlForMatchup = (controls: z.infer<typeof ControlMatchupSchema>) => {
  const pair = getControlPair(controls)
  return pair.player === null ? ("combined" as const) : pair.player === "C" ? "classic" : "modern"
}
const opponentControlForMatchup = (controls: z.infer<typeof ControlMatchupSchema>) => {
  const pair = getControlPair(controls)
  return pair.opponent === null
    ? ("combined" as const)
    : pair.opponent === "C"
      ? "classic"
      : "modern"
}

const matchupExplorerProcedure = os
  .input(MatchupExplorerInputSchema)
  .output(MatchupExplorerOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      if (input.view === "head-to-head") {
        const controls = getEffectiveControls(input.rank, input.controls)
        const [block, controlBlocks, playerUsageBlock, opponentUsageBlock] = await Promise.all([
          getRankBlock(input.period, input.rank, controls),
          getRankControlBlocks(input.period, input.rank),
          getUsageBlock(input.period, input.rank, playerControlForMatchup(controls)),
          getUsageBlock(input.period, input.rank, opponentControlForMatchup(controls)),
        ])
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
        return {
          view: "head-to-head" as const,
          headToHead: pair,
          playerUsage: getUsageCharacter(playerUsageBlock, input.character)?.playRate ?? null,
          opponentUsage: getUsageCharacter(opponentUsageBlock, input.opponent)?.playRate ?? null,
          controlMatchups,
        }
      }

      if (input.view === "profile") {
        const controls = getEffectiveControls(input.rank, input.controls)
        const [block, opponentUsageBlock] = await Promise.all([
          getRankBlock(input.period, input.rank, controls),
          getUsageBlock(input.period, input.rank, opponentControlForMatchup(controls)),
        ])
        const profile = getMatchupProfile(block, controls, input.character, opponentUsageBlock)
        return {
          view: "profile" as const,
          profile: profile.rows,
          summary: profile.summary,
          similarProfiles: getSimilarProfiles(block, controls, input.character),
        }
      }

      if (input.view === "ranks") {
        const availability = await getSnapshotPeriodAvailability()
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
        return {
          view: "ranks" as const,
          rankProgression: getPairProgression(rankEntries, input.character, input.opponent),
        }
      }

      const controls = getEffectiveControls(input.rank, input.controls)
      const availability = await getSnapshotPeriodAvailability()
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
      return {
        view: "time" as const,
        timeProgression: getPairTrend(timeEntries, input.character, input.opponent, controls),
      }
    }),
  )

export { matchupExplorerProcedure }
