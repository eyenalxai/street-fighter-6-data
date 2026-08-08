import * as z from "zod"

const RankIdSchema = z.enum([
  "rookie",
  "iron",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
  "all-master",
  "master",
  "high-master",
  "grand-master",
  "ultimate-master",
])
const RankGroupSchema = z.enum(["standard", "master"])
const RankSchema = z.object({
  id: RankIdSchema,
  label: z.string().min(1),
  group: RankGroupSchema,
  supportsControlBreakdown: z.boolean(),
})
const ControlComparisonRankIdSchema = RankIdSchema.extract([
  "rookie",
  "iron",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
  "all-master",
] as const)

type RankId = z.infer<typeof RankIdSchema>
type Rank = z.infer<typeof RankSchema>
type ControlComparisonRankId = z.infer<typeof ControlComparisonRankIdSchema>

const RANKS = RankSchema.array().parse([
  { id: "rookie", label: "Rookie", group: "standard", supportsControlBreakdown: true },
  { id: "iron", label: "Iron", group: "standard", supportsControlBreakdown: true },
  { id: "bronze", label: "Bronze", group: "standard", supportsControlBreakdown: true },
  { id: "silver", label: "Silver", group: "standard", supportsControlBreakdown: true },
  { id: "gold", label: "Gold", group: "standard", supportsControlBreakdown: true },
  { id: "platinum", label: "Platinum", group: "standard", supportsControlBreakdown: true },
  { id: "diamond", label: "Diamond", group: "standard", supportsControlBreakdown: true },
  { id: "all-master", label: "All Master", group: "master", supportsControlBreakdown: true },
  { id: "master", label: "Master", group: "master", supportsControlBreakdown: false },
  { id: "high-master", label: "High Master", group: "master", supportsControlBreakdown: false },
  { id: "grand-master", label: "Grand Master", group: "master", supportsControlBreakdown: false },
  {
    id: "ultimate-master",
    label: "Ultimate Master",
    group: "master",
    supportsControlBreakdown: false,
  },
])

const STANDARD_RANKS = RANKS.filter((rank) => rank.supportsControlBreakdown)
const MASTER_SUBDIVISION_RANKS = RANKS.filter(
  (rank) => rank.group === "master" && !rank.supportsControlBreakdown,
)

const getRank = (rankId: string): Rank | undefined => RANKS.find((rank) => rank.id === rankId)
const isMasterSubdivisionRank = (rankId: RankId): boolean =>
  MASTER_SUBDIVISION_RANKS.some((rank) => rank.id === rankId)
const supportsControlBreakdown = (rankId: RankId): boolean =>
  getRank(rankId)?.supportsControlBreakdown ?? false

export {
  getRank,
  ControlComparisonRankIdSchema,
  isMasterSubdivisionRank,
  MASTER_SUBDIVISION_RANKS,
  RankIdSchema,
  RankSchema,
  RANKS,
  STANDARD_RANKS,
  supportsControlBreakdown,
  type Rank,
  type RankId,
  type ControlComparisonRankId,
}
