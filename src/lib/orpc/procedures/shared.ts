import * as z from "zod"

import { CharacterIdSchema } from "@/lib/sf6/model"

const CharacterMetricRowSchema = z.object({
  characterId: CharacterIdSchema,
  averageWinRate: z.number().min(0).max(100).nullable(),
  weightedAverageWinRate: z.number().min(0).max(100).nullable(),
  usage: z.number().min(0).max(100).nullable(),
  averageWinRateDelta: z.number().min(-100).max(100).nullable(),
  weightedAverageWinRateDelta: z.number().min(-100).max(100).nullable(),
  usageDelta: z.number().min(-100).max(100).nullable(),
  debut: z.boolean(),
  floor: z.number().min(0).max(100).nullable(),
  favorableCount: z.number().int().nonnegative(),
  availableCount: z.number().int().nonnegative(),
  possibleCount: z.number().int().nonnegative(),
  weightCoverage: z.number().min(0).max(1).nullable(),
  topThreeLift: z.number().min(-100).max(100).nullable(),
})
const ControlComparisonResultSchema = z.object({
  characterId: CharacterIdSchema,
  classic: z.number().min(0).max(100).nullable(),
  modern: z.number().min(0).max(100).nullable(),
  averageWinRateDelta: z.number().min(-100).max(100).nullable(),
  weightedClassic: z.number().min(0).max(100).nullable(),
  weightedModern: z.number().min(0).max(100).nullable(),
  weightedAverageWinRateDelta: z.number().min(-100).max(100).nullable(),
  classicWeightCoverage: z.number().min(0).max(1).nullable(),
  modernWeightCoverage: z.number().min(0).max(1).nullable(),
  classicUsage: z.number().min(0).max(100).nullable(),
  modernUsage: z.number().min(0).max(100).nullable(),
  usageDelta: z.number().min(-100).max(100).nullable(),
})

export { CharacterMetricRowSchema, ControlComparisonResultSchema }
