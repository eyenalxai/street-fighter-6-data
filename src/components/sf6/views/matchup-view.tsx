import { useSuspenseQuery } from "@tanstack/react-query"
import { ArrowRight, Minus, Plus } from "lucide-react"

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
import { getCharacterName } from "@/lib/sf6/model"
import { matchupsQueryOptions } from "@/lib/sf6/query-options"

type MatchupListRow = {
  opponentId: CharacterId
  winRate: number
}

const CharacterSelector = ({
  characterId,
  onClick,
  align = "left",
}: {
  characterId: CharacterId
  onClick: () => void
  align?: "left" | "right"
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : "text-left"}`}
  >
    <CharacterBadge characterId={characterId} />
    <span>
      <span className="block font-medium">
        <CharacterName characterId={characterId} />
      </span>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        Swap side <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </span>
  </button>
)

const MatchupList = ({
  title,
  rows,
  onSelect,
}: {
  title: string
  rows: MatchupListRow[]
  onSelect: (opponentId: CharacterId) => void
}) => (
  <AnalyticsPanel title={title}>
    <div className="flex flex-col divide-y divide-border">
      {rows.map((row) => (
        <button
          key={row.opponentId}
          type="button"
          onClick={() => {
            onSelect(row.opponentId)
          }}
          className="flex items-center gap-3 py-2 text-left hover:bg-accent/40"
        >
          <CharacterBadge characterId={row.opponentId} size="small" />
          <span className="flex-1 text-sm">
            <CharacterName characterId={row.opponentId} />
          </span>
          <WinRate value={row.winRate} />
          {row.winRate >= 50 ? (
            <Plus className="size-3 text-wr-strong" />
          ) : (
            <Minus className="size-3 text-wr-weak" />
          )}
        </button>
      ))}
    </div>
  </AnalyticsPanel>
)

const MatchupView = ({ period, search, onChange }: DashboardViewProps) => {
  const { data } = useSuspenseQuery(
    matchupsQueryOptions({
      period,
      league: search.league,
      controls: search.controls,
      character: search.character,
      opponent: search.opponent,
    }),
  )
  const selectedName = getCharacterName(search.character)
  const opponentName = getCharacterName(search.opponent)
  const statusLabel =
    data.headToHead.status === "mirror"
      ? "Mirror matchup"
      : data.headToHead.status === "unavailable"
        ? "No reported cell"
        : "Reported matchup"

  return (
    <div className="flex flex-col gap-5">
      <AnalyticsPanel
        title="Head to head"
        description={`${selectedName} vs ${opponentName} · ${statusLabel}`}
      >
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <CharacterSelector
            characterId={search.character}
            onClick={() => {
              onChange({ character: search.opponent })
            }}
          />
          <div className="flex flex-col items-center gap-1">
            <WinRate value={data.headToHead.winRate} className="text-4xl font-semibold" />
            <span className="text-xs text-muted-foreground">{selectedName} win rate</span>
          </div>
          <CharacterSelector
            characterId={search.opponent}
            onClick={() => {
              onChange({ opponent: search.character })
            }}
            align="right"
          />
        </div>
      </AnalyticsPanel>

      <AnalyticsPanel
        title="Control matchup grid"
        description="Direct Buckler cells; Combined and mixed All/specific combinations are not approximated"
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {data.controls.map((control) => (
            <div key={control.controlMatchup} className="border border-border p-3">
              <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                {control.label}
              </p>
              <WinRate value={control.winRate} className="mt-2 text-xl" />
            </div>
          ))}
        </div>
      </AnalyticsPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <MatchupList
          title={`Best matchups for ${selectedName}`}
          rows={data.best}
          onSelect={(opponentId) => {
            onChange({ opponent: opponentId })
          }}
        />
        <MatchupList
          title={`Worst matchups for ${selectedName}`}
          rows={data.worst}
          onSelect={(opponentId) => {
            onChange({ opponent: opponentId })
          }}
        />
      </div>

      <AnalyticsPanel
        title="Best counterpicks"
        description={`Characters with the highest reported win rate against ${selectedName}`}
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Character</TableHead>
              <TableHead scope="col" className="text-right">
                Win rate
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.counterpicks.map((row) => (
              <TableRow
                key={row.counterId}
                className="cursor-pointer"
                onClick={() => {
                  onChange({ character: row.counterId })
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CharacterBadge characterId={row.counterId} size="small" />
                    <CharacterName characterId={row.counterId} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.counterWinRate} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </div>
  )
}

export { MatchupView }
