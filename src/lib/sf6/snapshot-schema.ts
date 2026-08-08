import * as z from "zod"

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
const ProcessedRankedLeaguesSchema = z.record(
  z.string().regex(/^[1-8]$/u),
  ProcessedDiaLeagueSchema,
)
const ProcessedRankedSnapshotSchema = z
  .object({
    c: ProcessedRankedLeaguesSchema,
    ci: ProcessedRankedLeaguesSchema,
  })
  .strict()
const ProcessedMasterSnapshotSchema = z
  .object({
    c: z
      .object({
        "36": ProcessedDiaLeagueSchema,
        "39": ProcessedDiaLeagueSchema,
        "40": ProcessedDiaLeagueSchema,
        "41": ProcessedDiaLeagueSchema,
        "42": ProcessedDiaLeagueSchema,
      })
      .strict(),
  })
  .strict()

type ProcessedDiaPlayer = z.infer<typeof ProcessedDiaPlayerSchema>
type ProcessedDiaLeague = z.infer<typeof ProcessedDiaLeagueSchema>
type ProcessedRankedSnapshot = z.infer<typeof ProcessedRankedSnapshotSchema>
type ProcessedMasterSnapshot = z.infer<typeof ProcessedMasterSnapshotSchema>

const getPlayerCharacterId = (player: ProcessedDiaPlayer): string =>
  typeof player === "string" ? player : player[0]

const getPlayerControl = (player: ProcessedDiaPlayer): "C" | "M" | null =>
  typeof player === "string" ? null : player[1]

export {
  getPlayerCharacterId,
  getPlayerControl,
  ProcessedDiaLeagueSchema,
  ProcessedDiaMatrixSchema,
  ProcessedDiaPlayerSchema,
  ProcessedMasterSnapshotSchema,
  ProcessedRankedLeaguesSchema,
  ProcessedRankedSnapshotSchema,
  type ProcessedDiaLeague,
  type ProcessedDiaPlayer,
  type ProcessedMasterSnapshot,
  type ProcessedRankedSnapshot,
}
