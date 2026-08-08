import * as z from "zod"

const ReportingPeriodSchema = z.string().regex(/^\d{6}$/u, "Expected YYYYMM")
const CharacterIdSchema = z.enum([
  "ryu",
  "ken",
  "chunli",
  "guile",
  "blanka",
  "dhalsim",
  "honda",
  "zangief",
  "cammy",
  "deejay",
  "jp",
  "juri",
  "kimberly",
  "lily",
  "luke",
  "manon",
  "marisa",
  "jamie",
  "rashid",
  "aki",
  "ed",
  "gouki",
  "vega",
  "terry",
  "mai",
  "elena",
  "sagat",
  "cviper",
  "alex",
  "ingrid",
])
const UniqueCharacterIdsSchema = CharacterIdSchema.array().superRefine((characterIds, context) => {
  if (new Set(characterIds).size !== characterIds.length) {
    context.addIssue({
      code: "custom",
      message: "Character IDs must be unique",
    })
  }
})
const NonEmptyUniqueCharacterIdsSchema = UniqueCharacterIdsSchema.pipe(
  CharacterIdSchema.array().min(1),
)
const ControlTypeSchema = z.enum(["C", "M"])
const PlayerControlSchema = z.enum(["combined", "classic", "modern"])
const ControlMatchupSchema = z.enum([
  "combined",
  "classic-classic",
  "classic-modern",
  "modern-classic",
  "modern-modern",
])

const CharacterSchema = z.object({
  id: CharacterIdSchema,
  name: z.string().min(1),
  short: z.string().min(1),
})
const ControlMatchupOptionSchema = z.object({
  id: ControlMatchupSchema,
  label: z.string().min(1),
  player: ControlTypeSchema.nullable(),
  opponent: ControlTypeSchema.nullable(),
})

type Character = z.infer<typeof CharacterSchema>
type CharacterId = z.infer<typeof CharacterIdSchema>
type ControlMatchup = z.infer<typeof ControlMatchupSchema>
type ControlType = z.infer<typeof ControlTypeSchema>
type PlayerControl = z.infer<typeof PlayerControlSchema>
type ReportingPeriod = z.infer<typeof ReportingPeriodSchema>

const CHARACTERS = CharacterSchema.array().parse([
  { id: "ryu", name: "Ryu", short: "RYU" },
  { id: "ken", name: "Ken", short: "KEN" },
  { id: "chunli", name: "Chun-Li", short: "CHN" },
  { id: "guile", name: "Guile", short: "GUI" },
  { id: "blanka", name: "Blanka", short: "BLK" },
  { id: "dhalsim", name: "Dhalsim", short: "DHL" },
  { id: "honda", name: "E. Honda", short: "HND" },
  { id: "zangief", name: "Zangief", short: "ZGF" },
  { id: "cammy", name: "Cammy", short: "CMY" },
  { id: "deejay", name: "Dee Jay", short: "DJ" },
  { id: "jp", name: "JP", short: "JP" },
  { id: "juri", name: "Juri", short: "JUR" },
  { id: "kimberly", name: "Kimberly", short: "KIM" },
  { id: "lily", name: "Lily", short: "LLY" },
  { id: "luke", name: "Luke", short: "LUK" },
  { id: "manon", name: "Manon", short: "MAN" },
  { id: "marisa", name: "Marisa", short: "MRS" },
  { id: "jamie", name: "Jamie", short: "JAM" },
  { id: "rashid", name: "Rashid", short: "RSH" },
  { id: "aki", name: "A.K.I.", short: "AKI" },
  { id: "ed", name: "Ed", short: "ED" },
  { id: "gouki", name: "Akuma", short: "AKU" },
  { id: "vega", name: "M. Bison", short: "BSN" },
  { id: "terry", name: "Terry", short: "TRY" },
  { id: "mai", name: "Mai", short: "MAI" },
  { id: "elena", name: "Elena", short: "ELN" },
  { id: "sagat", name: "Sagat", short: "SGT" },
  { id: "cviper", name: "C. Viper", short: "VIP" },
  { id: "alex", name: "Alex", short: "ALX" },
  { id: "ingrid", name: "Ingrid", short: "ING" },
])

const CONTROL_MATCHUPS = ControlMatchupOptionSchema.array().parse([
  { id: "combined", label: "All control styles", player: null, opponent: null },
  {
    id: "classic-classic",
    label: "Classic player / Classic opponent",
    player: "C",
    opponent: "C",
  },
  {
    id: "classic-modern",
    label: "Classic player / Modern opponent",
    player: "C",
    opponent: "M",
  },
  {
    id: "modern-classic",
    label: "Modern player / Classic opponent",
    player: "M",
    opponent: "C",
  },
  {
    id: "modern-modern",
    label: "Modern player / Modern opponent",
    player: "M",
    opponent: "M",
  },
])
const PLAYER_CONTROLS = [
  { id: "combined", label: "All control styles" },
  { id: "classic", label: "Classic players" },
  { id: "modern", label: "Modern players" },
] as const satisfies readonly { id: PlayerControl; label: string }[]

const CHARACTER_MAP = Object.fromEntries(CHARACTERS.map((character) => [character.id, character]))

const getCharacter = (characterId: string): Character | undefined => CHARACTER_MAP[characterId]
const getCharacterName = (characterId: string): string =>
  getCharacter(characterId)?.name ?? characterId
const formatReportingPeriod = (period: string): string => {
  const year = period.slice(0, 4)
  const month = Number(period.slice(4, 6))
  const monthName = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(2024, month - 1, 1)),
  )
  return `${monthName} ${year}`
}

export {
  CharacterIdSchema,
  NonEmptyUniqueCharacterIdsSchema,
  CharacterSchema,
  CHARACTERS,
  CHARACTER_MAP,
  ControlMatchupOptionSchema,
  ControlMatchupSchema,
  CONTROL_MATCHUPS,
  ControlTypeSchema,
  PlayerControlSchema,
  PLAYER_CONTROLS,
  formatReportingPeriod,
  getCharacter,
  getCharacterName,
  ReportingPeriodSchema,
  UniqueCharacterIdsSchema,
  type Character,
  type CharacterId,
  type ControlMatchup,
  type ControlType,
  type PlayerControl,
  type ReportingPeriod,
}
