type RawUsageCharacter = {
  character_tool_name: string
  play_rate: number
  previous_rate?: number
  count?: number
}

type RawUsageRank = {
  league_rank: number
  val: RawUsageCharacter[]
}

type RawUsageOperation = {
  operation_type?: number
  val: RawUsageRank[]
}

type RawUsageSnapshot = {
  usagerateData: RawUsageOperation[]
}

type CompactUsageCharacter =
  | [characterId: string, playRate: number]
  | [characterId: string, playRate: number, previousRate: number]
  | [characterId: string, playRate: number, previousRate: number, count: number]

type ProcessedUsageRank = {
  ot: number
  lr: number
  c: CompactUsageCharacter[]
}

const compactCharacter = (character: RawUsageCharacter): CompactUsageCharacter => {
  const previousRate = character.previous_rate ?? 0
  const count = character.count ?? 1
  if (count === 1 && previousRate === 0) {
    return [character.character_tool_name, character.play_rate]
  }
  if (count === 1) {
    return [character.character_tool_name, character.play_rate, previousRate]
  }
  return [character.character_tool_name, character.play_rate, previousRate, count]
}

export function normalizeUsageRate(raw: unknown): ProcessedUsageRank[] {
  const snapshot = raw as RawUsageSnapshot
  return snapshot.usagerateData.flatMap((operation) =>
    operation.val.map((rank) => ({
      ot: operation.operation_type ?? 0,
      lr: rank.league_rank,
      c: rank.val.map(compactCharacter),
    })),
  )
}
