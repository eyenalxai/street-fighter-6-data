type RawDiaHeader = {
  id: number
  tool_name: string
  input_type?: string
}

type RawDiaCell = {
  _oid: number
  val: string
}

type RawDiaRecord = {
  tool_name: string
  input_type?: string
  values: RawDiaCell[]
}

type RawDiaLeague = {
  opponent_header: RawDiaHeader[]
  records: RawDiaRecord[]
}

type RawDiaSnapshot = {
  diaData: Record<string, Record<string, Record<string, RawDiaLeague>>>
}

export type ProcessedDiaPlayer = string | [string, string]

export type ProcessedDiaLeague = {
  p: ProcessedDiaPlayer[]
  m: (number | null)[][]
}

export type ProcessedDia = Record<string, Record<string, ProcessedDiaLeague>>

const DIA_SORT = "d_sort"

function parseWinRate(value: string): number | null {
  if (value === "-" || value === "-.---" || value === "") {
    return null
  }
  return Math.round((Number(value) / 10) * 10_000) / 10_000
}

function playerKey(record: RawDiaRecord): ProcessedDiaPlayer {
  if (record.input_type === undefined) {
    return record.tool_name
  }
  return [record.tool_name, record.input_type]
}

function normalizeLeague(block: RawDiaLeague): ProcessedDiaLeague {
  const idToHeader = new Map(block.opponent_header.map((header) => [header.id, header]))
  const players = block.records.map(playerKey)

  const matrix = block.records.map((record) =>
    record.values.map((cell) => {
      const opponent = idToHeader.get(cell._oid)
      if (opponent === undefined) {
        return null
      }
      return parseWinRate(cell.val)
    }),
  )

  return { p: players, m: matrix }
}

function normalizeControlView(
  controlData: Record<string, Record<string, RawDiaLeague>>,
): Record<string, ProcessedDiaLeague> {
  const sortData = controlData[DIA_SORT]
  if (sortData === undefined) {
    throw new Error(`Missing ${DIA_SORT} in diagram control view`)
  }

  const leagues: Record<string, ProcessedDiaLeague> = {}
  for (const [league, block] of Object.entries(sortData)) {
    leagues[league] = normalizeLeague(block)
  }
  return leagues
}

export function normalizeDia(raw: unknown): ProcessedDia {
  const snapshot = raw as RawDiaSnapshot
  const output: ProcessedDia = {}

  for (const [controlView, controlData] of Object.entries(snapshot.diaData)) {
    output[controlView] = normalizeControlView(controlData)
  }

  return output
}
