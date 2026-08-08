import * as z from "zod"

import type { CharacterId } from "./model"

import { CharacterIdSchema } from "./model"

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
const ProcessedUsageCharacterSchema = z.union([
  z.tuple([CharacterIdSchema, z.number().min(0).max(100)]),
  z.tuple([CharacterIdSchema, z.number().min(0).max(100), z.number().min(0).max(100)]),
  z.tuple([
    CharacterIdSchema,
    z.number().min(0).max(100),
    z.number().min(0).max(100),
    z.number().int().positive(),
  ]),
])
const UsageLeagueRankSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(36),
  z.literal(40),
  z.literal(41),
  z.literal(42),
])
const ProcessedUsageRankSchema = z
  .object({
    ot: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    lr: UsageLeagueRankSchema,
    c: ProcessedUsageCharacterSchema.array(),
  })
  .strict()
const ProcessedUsageSnapshotSchema = ProcessedUsageRankSchema.array().superRefine(
  (buckets, context) => {
    const bucketKeys = new Set<string>()
    for (const [index, bucket] of buckets.entries()) {
      const bucketKey = `${bucket.ot}:${bucket.lr}`
      if (bucketKeys.has(bucketKey)) {
        context.addIssue({
          code: "custom",
          message: "Usage buckets must have unique operation and league keys",
          path: [index],
        })
      }
      bucketKeys.add(bucketKey)

      const characterIds = bucket.c.map(([characterId]) => characterId)
      if (new Set(characterIds).size !== characterIds.length) {
        context.addIssue({
          code: "custom",
          message: "Usage characters must be unique within a bucket",
          path: [index, "c"],
        })
      }
    }
  },
)

type ProcessedDiaPlayer = z.infer<typeof ProcessedDiaPlayerSchema>
type ProcessedDiaLeague = z.infer<typeof ProcessedDiaLeagueSchema>
type ProcessedRankedSnapshot = z.infer<typeof ProcessedRankedSnapshotSchema>
type ProcessedMasterSnapshot = z.infer<typeof ProcessedMasterSnapshotSchema>
type ProcessedUsageCharacter = z.infer<typeof ProcessedUsageCharacterSchema>
type ProcessedUsageRank = z.infer<typeof ProcessedUsageRankSchema>
type ProcessedUsageSnapshot = z.infer<typeof ProcessedUsageSnapshotSchema>

const getPlayerCharacterId = (player: ProcessedDiaPlayer): string =>
  typeof player === "string" ? player : player[0]

const getPlayerControl = (player: ProcessedDiaPlayer): "C" | "M" | null =>
  typeof player === "string" ? null : player[1]
const getUsageCharacterId = (character: ProcessedUsageCharacter): CharacterId => character[0]
const getUsagePlayRate = (character: ProcessedUsageCharacter): number => character[1]
const getUsagePreviousRate = (character: ProcessedUsageCharacter): number => character[2] ?? 0
const getUsageCount = (character: ProcessedUsageCharacter): number => character[3] ?? 1

export {
  getPlayerCharacterId,
  getPlayerControl,
  getUsageCharacterId,
  getUsageCount,
  getUsagePlayRate,
  getUsagePreviousRate,
  ProcessedDiaLeagueSchema,
  ProcessedDiaMatrixSchema,
  ProcessedDiaPlayerSchema,
  ProcessedMasterSnapshotSchema,
  ProcessedRankedLeaguesSchema,
  ProcessedRankedSnapshotSchema,
  ProcessedUsageCharacterSchema,
  ProcessedUsageRankSchema,
  ProcessedUsageSnapshotSchema,
  type ProcessedDiaLeague,
  type ProcessedDiaPlayer,
  type ProcessedMasterSnapshot,
  type ProcessedRankedSnapshot,
  type ProcessedUsageCharacter,
  type ProcessedUsageRank,
  type ProcessedUsageSnapshot,
}
