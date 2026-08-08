import { Link } from "@tanstack/react-router"

import type { CharacterId } from "@/lib/sf6/model"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { WinRate } from "@/components/sf6/win-rate"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type OpponentWinRateRow = {
  opponentId: CharacterId
  winRate: number
}

const OpponentMatchupTable = ({
  title,
  description,
  rows,
}: {
  title: string
  description: string
  rows: readonly OpponentWinRateRow[]
}) => (
  <AnalyticsPanel title={title} description={description} contentClassName="p-0">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Opponent</TableHead>
          <TableHead scope="col" className="text-right">
            Win rate
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.opponentId}>
            <TableCell>
              <Link
                to="/matchups"
                search={(previous) => {
                  return { ...previous, opponent: row.opponentId }
                }}
                className="inline-flex items-center gap-2 font-medium hover:underline"
              >
                <CharacterBadge characterId={row.opponentId} size="small" />
                <CharacterName characterId={row.opponentId} />
              </Link>
            </TableCell>
            <TableCell className="text-right">
              <WinRate value={row.winRate} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </AnalyticsPanel>
)

export { OpponentMatchupTable }
