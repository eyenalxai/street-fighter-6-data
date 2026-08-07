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
const ControlTypeSchema = z.enum(["C", "M"])
const LeagueIdSchema = z.enum(["1", "2", "3", "4", "5", "6", "7", "8"])
const DashboardViewSchema = z.enum([
  "leaderboard",
  "trends",
  "ranks",
  "control",
  "matchups",
  "counterpicks",
  "compare",
  "similarity",
  "balance",
])
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
  introPeriod: ReportingPeriodSchema,
})
const LeagueSchema = z.object({
  id: LeagueIdSchema,
  label: z.string().min(1),
})
const ControlMatchupOptionSchema = z.object({
  id: ControlMatchupSchema,
  label: z.string().min(1),
  player: ControlTypeSchema.nullable(),
  opponent: ControlTypeSchema.nullable(),
})

type Character = z.infer<typeof CharacterSchema>
type CharacterId = z.infer<typeof CharacterIdSchema>
type League = z.infer<typeof LeagueSchema>
type ControlMatchup = z.infer<typeof ControlMatchupSchema>
type ControlType = z.infer<typeof ControlTypeSchema>
type DashboardView = z.infer<typeof DashboardViewSchema>
type LeagueId = z.infer<typeof LeagueIdSchema>
type ReportingPeriod = z.infer<typeof ReportingPeriodSchema>

const CHARACTERS = CharacterSchema.array().parse([
  { id: "ryu", name: "Ryu", short: "RYU", introPeriod: "202306" },
  { id: "ken", name: "Ken", short: "KEN", introPeriod: "202306" },
  { id: "chunli", name: "Chun-Li", short: "CHN", introPeriod: "202306" },
  { id: "guile", name: "Guile", short: "GUI", introPeriod: "202306" },
  { id: "blanka", name: "Blanka", short: "BLK", introPeriod: "202306" },
  { id: "dhalsim", name: "Dhalsim", short: "DHL", introPeriod: "202306" },
  { id: "honda", name: "E. Honda", short: "HND", introPeriod: "202306" },
  { id: "zangief", name: "Zangief", short: "ZGF", introPeriod: "202306" },
  { id: "cammy", name: "Cammy", short: "CMY", introPeriod: "202306" },
  { id: "deejay", name: "Dee Jay", short: "DJ", introPeriod: "202306" },
  { id: "jp", name: "JP", short: "JP", introPeriod: "202306" },
  { id: "juri", name: "Juri", short: "JUR", introPeriod: "202306" },
  { id: "kimberly", name: "Kimberly", short: "KIM", introPeriod: "202306" },
  { id: "lily", name: "Lily", short: "LLY", introPeriod: "202306" },
  { id: "luke", name: "Luke", short: "LUK", introPeriod: "202306" },
  { id: "manon", name: "Manon", short: "MAN", introPeriod: "202306" },
  { id: "marisa", name: "Marisa", short: "MRS", introPeriod: "202306" },
  { id: "jamie", name: "Jamie", short: "JAM", introPeriod: "202306" },
  { id: "rashid", name: "Rashid", short: "RSH", introPeriod: "202307" },
  { id: "aki", name: "A.K.I.", short: "AKI", introPeriod: "202309" },
  { id: "ed", name: "Ed", short: "ED", introPeriod: "202402" },
  { id: "gouki", name: "Akuma", short: "AKU", introPeriod: "202405" },
  { id: "vega", name: "M. Bison", short: "BSN", introPeriod: "202406" },
  { id: "terry", name: "Terry", short: "TRY", introPeriod: "202409" },
  { id: "mai", name: "Mai", short: "MAI", introPeriod: "202502" },
  { id: "elena", name: "Elena", short: "ELN", introPeriod: "202506" },
  { id: "sagat", name: "Sagat", short: "SGT", introPeriod: "202508" },
  { id: "cviper", name: "C. Viper", short: "VIP", introPeriod: "202510" },
  { id: "alex", name: "Alex", short: "ALX", introPeriod: "202603" },
  { id: "ingrid", name: "Ingrid", short: "ING", introPeriod: "202605" },
])

const LEAGUES = LeagueSchema.array().parse([
  { id: "1", label: "Rookie" },
  { id: "2", label: "Iron" },
  { id: "3", label: "Bronze" },
  { id: "4", label: "Silver" },
  { id: "5", label: "Gold" },
  { id: "6", label: "Platinum" },
  { id: "7", label: "Diamond" },
  { id: "8", label: "Master" },
])

const CONTROL_MATCHUPS = ControlMatchupOptionSchema.array().parse([
  { id: "combined", label: "Combined", player: null, opponent: null },
  { id: "classic-classic", label: "Classic vs Classic", player: "C", opponent: "C" },
  { id: "classic-modern", label: "Classic vs Modern", player: "C", opponent: "M" },
  { id: "modern-classic", label: "Modern vs Classic", player: "M", opponent: "C" },
  { id: "modern-modern", label: "Modern vs Modern", player: "M", opponent: "M" },
])

const CHARACTER_MAP = Object.fromEntries(CHARACTERS.map((character) => [character.id, character]))
const LEAGUE_MAP = Object.fromEntries(LEAGUES.map((league) => [league.id, league]))

const getCharacter = (characterId: string): Character | undefined => CHARACTER_MAP[characterId]
const getLeague = (leagueId: string): League | undefined => LEAGUE_MAP[leagueId]
const getCharacterName = (characterId: string): string =>
  getCharacter(characterId)?.name ?? characterId
const formatReportingPeriod = (period: ReportingPeriod): string => {
  const year = period.slice(0, 4)
  const month = Number(period.slice(4, 6))
  const monthName = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(2024, month - 1, 1)),
  )
  return `${monthName} ${year}`
}

export {
  CharacterIdSchema,
  CharacterSchema,
  CHARACTERS,
  CHARACTER_MAP,
  ControlMatchupOptionSchema,
  ControlMatchupSchema,
  CONTROL_MATCHUPS,
  ControlTypeSchema,
  DashboardViewSchema,
  formatReportingPeriod,
  getCharacter,
  getCharacterName,
  getLeague,
  LeagueIdSchema,
  LeagueSchema,
  LEAGUES,
  ReportingPeriodSchema,
  type Character,
  type CharacterId,
  type ControlMatchup,
  type ControlType,
  type DashboardView,
  type League,
  type LeagueId,
  type ReportingPeriod,
}
