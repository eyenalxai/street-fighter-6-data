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
  ot: 0 | 1 | 2
  lr: number
  c: CompactUsageCharacter[]
}

const normalizeOperationType = (operationType: number | undefined): 0 | 1 | 2 => {
  if (operationType === undefined || operationType === 0) {
    return 0
  }
  if (operationType === 1 || operationType === 2) {
    return operationType
  }
  throw new Error(`Unsupported usage operation type: ${operationType}`)
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
      ot: normalizeOperationType(operation.operation_type),
      lr: rank.league_rank,
      c: rank.val.map(compactCharacter),
    })),
  )
}
