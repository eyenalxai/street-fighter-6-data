type RawUsageCharacter = {
  character_tool_name: string
  play_rate: number
  previous_rate?: number
  count?: number
}

type RawUsageLeague = {
  league_rank: number
  val: RawUsageCharacter[]
}

type RawUsageEntry = {
  operation_type?: number
  val: RawUsageLeague[]
}

type RawUsageSnapshot = {
  usagerateData: RawUsageEntry[]
}

export type ProcessedUsageCharacter = [string, number, number?, number?]

export type ProcessedUsageSlice = {
  ot: number
  lr: number
  c: ProcessedUsageCharacter[]
}

function compactCharacter(char: RawUsageCharacter): ProcessedUsageCharacter {
  const entry: ProcessedUsageCharacter = [char.character_tool_name, char.play_rate]

  if (char.previous_rate !== undefined && char.previous_rate !== 0) {
    entry.push(char.previous_rate)
  }

  if (char.count !== undefined && char.count !== 1) {
    if (entry.length === 2) {
      entry.push(0)
    }
    entry.push(char.count)
  }

  return entry
}

export function normalizeUsage(raw: unknown): ProcessedUsageSlice[] {
  const snapshot = raw as RawUsageSnapshot
  const slices: ProcessedUsageSlice[] = []

  for (const entry of snapshot.usagerateData) {
    const operationType = entry.operation_type ?? 0

    for (const league of entry.val) {
      slices.push({
        ot: operationType,
        lr: league.league_rank,
        c: league.val.map(compactCharacter),
      })
    }
  }

  return slices
}
