import { useSuspenseQuery } from "@tanstack/react-query"
import { ArrowUpRight } from "lucide-react"

import type { DashboardViewProps } from "@/components/sf6/dashboard"
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
import { formatReportingPeriod } from "@/lib/sf6/model"
import { leaderboardQueryOptions } from "@/lib/sf6/query-options"

const SummaryRow = ({
  rank,
  characterId,
  winRate,
  onClick,
}: {
  rank: number
  characterId: CharacterId
  winRate: number
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex items-center gap-3 border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-accent/40"
  >
    <span className="w-5 text-center font-mono text-xs text-muted-foreground">{rank}</span>
    <CharacterBadge characterId={characterId} />
    <span className="flex-1 text-sm font-medium">
      <CharacterName characterId={characterId} />
    </span>
    <progress
      className="h-1.5 w-24 overflow-hidden accent-primary"
      value={Math.max(0, Math.min(100, winRate))}
      max={100}
      aria-label={`${winRate.toFixed(1)} percent matchup average`}
    />
    <WinRate value={winRate} className="w-12 text-right text-sm" />
    <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
  </button>
)

const LeaderboardTable = ({
  rows,
  startRank,
  onSelect,
}: {
  rows: { characterId: CharacterId; winRate: number }[]
  startRank: number
  onSelect: (characterId: CharacterId) => void
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead scope="col">#</TableHead>
        <TableHead scope="col">Character</TableHead>
        <TableHead scope="col" className="text-right">
          Matchup average
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((row, index) => (
        <TableRow
          key={row.characterId}
          className="cursor-pointer"
          onClick={() => {
            onSelect(row.characterId)
          }}
        >
          <TableCell className="font-mono text-xs text-muted-foreground">
            {startRank + index}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <CharacterBadge characterId={row.characterId} size="small" />
              <CharacterName characterId={row.characterId} />
            </div>
          </TableCell>
          <TableCell className="text-right">
            <WinRate value={row.winRate} className="font-semibold" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

const LeaderboardView = ({ period, search, meta, onChange }: DashboardViewProps) => {
  const { data } = useSuspenseQuery(
    leaderboardQueryOptions({
      period,
      league: search.league,
      controls: search.controls,
    }),
  )
  const leagueLabel = meta.leagues.find((league) => league.id === search.league)?.label ?? "Rank"
  const best = data.rows.slice(0, 5)
  const worst = data.rows.toReversed().slice(0, 5)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsPanel
          title="Top performers"
          description={`Highest matchup average at ${leagueLabel} · ${formatReportingPeriod(period)}`}
        >
          <div className="flex flex-col gap-1.5">
            {best.map((row, index) => (
              <SummaryRow
                key={row.characterId}
                rank={index + 1}
                characterId={row.characterId}
                winRate={row.winRate}
                onClick={() => {
                  onChange({ character: row.characterId })
                }}
              />
            ))}
          </div>
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Struggling characters"
          description={`Lowest matchup average at ${leagueLabel} · ${formatReportingPeriod(period)}`}
        >
          <div className="flex flex-col gap-1.5">
            {worst.map((row, index) => (
              <SummaryRow
                key={row.characterId}
                rank={data.rows.length - index}
                characterId={row.characterId}
                winRate={row.winRate}
                onClick={() => {
                  onChange({ character: row.characterId })
                }}
              />
            ))}
          </div>
        </AnalyticsPanel>
      </div>

      <AnalyticsPanel
        title="Full leaderboard"
        description={`${data.rows.length} characters · sorted by matchup average`}
        action={<span className="text-xs text-muted-foreground">Controls: {search.controls}</span>}
        contentClassName="p-0"
      >
        <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-y-0">
          <LeaderboardTable
            rows={data.rows.slice(0, Math.ceil(data.rows.length / 2))}
            startRank={1}
            onSelect={(characterId) => {
              onChange({ character: characterId })
            }}
          />
          <LeaderboardTable
            rows={data.rows.slice(Math.ceil(data.rows.length / 2))}
            startRank={Math.ceil(data.rows.length / 2) + 1}
            onSelect={(characterId) => {
              onChange({ character: characterId })
            }}
          />
        </div>
      </AnalyticsPanel>
    </div>
  )
}

export { LeaderboardView }
