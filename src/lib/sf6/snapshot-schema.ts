import * as z from "zod"

import type { LeagueId } from "./model"

import { LeagueIdSchema } from "./model"

const ProcessedDiaPlayerSchema = z.union([
  z.string().min(1),
  z.tuple([z.string().min(1), z.enum(["C", "M"])]),
])
const ProcessedDiaMatrixSchema = z.array(z.array(z.number().min(0).max(1).nullable()))
const ProcessedDiaLeagueSchema = z
  .object({
    p: z.array(ProcessedDiaPlayerSchema).min(1),
    m: ProcessedDiaMatrixSchema,
  })
  .superRefine((league, context) => {
    if (league.m.length !== league.p.length) {
      context.addIssue({
        code: "custom",
        message: "Matrix row count must match player count",
        path: ["m"],
      })
    }

    const invalidRow = league.m.findIndex((row) => row.length !== league.p.length)
    if (invalidRow !== -1) {
      context.addIssue({
        code: "custom",
        message: "Every matrix row must match player count",
        path: ["m", invalidRow],
      })
    }
  })
const ProcessedDiaLeaguesSchema = z.record(z.string().regex(/^[1-8]$/u), ProcessedDiaLeagueSchema)
const ProcessedDiaSnapshotSchema = z
  .object({
    c: ProcessedDiaLeaguesSchema,
    ci: ProcessedDiaLeaguesSchema,
  })
  .strict()

type ProcessedDiaPlayer = z.infer<typeof ProcessedDiaPlayerSchema>
type ProcessedDiaLeague = z.infer<typeof ProcessedDiaLeagueSchema>
type ProcessedDiaSnapshot = z.infer<typeof ProcessedDiaSnapshotSchema>

const getPlayerCharacterId = (player: ProcessedDiaPlayer): string =>
  typeof player === "string" ? player : player[0]

const getPlayerControl = (player: ProcessedDiaPlayer): "C" | "M" | null =>
  typeof player === "string" ? null : player[1]

const getLeagueId = (leagueId: string): LeagueId | undefined => {
  const parsed = LeagueIdSchema.safeParse(leagueId)
  return parsed.success ? parsed.data : undefined
}

export {
  getLeagueId,
  getPlayerCharacterId,
  getPlayerControl,
  ProcessedDiaLeagueSchema,
  ProcessedDiaLeaguesSchema,
  ProcessedDiaMatrixSchema,
  ProcessedDiaPlayerSchema,
  ProcessedDiaSnapshotSchema,
  type ProcessedDiaLeague,
  type ProcessedDiaPlayer,
  type ProcessedDiaSnapshot,
}
