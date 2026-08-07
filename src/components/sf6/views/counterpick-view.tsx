import { useSuspenseQuery } from "@tanstack/react-query"
import { Plus, X } from "lucide-react"
import { useState } from "react"

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
import { counterpicksQueryOptions } from "@/lib/sf6/query-options"

const CounterpickView = ({ period, search, meta, onChange }: DashboardViewProps) => {
  const [threatSelection, setThreatSelection] = useState({
    character: search.character,
    opponent: search.opponent,
    threats: [...new Set([search.character, search.opponent])],
  })
  const threats =
    threatSelection.character === search.character && threatSelection.opponent === search.opponent
      ? threatSelection.threats
      : [...new Set([search.character, search.opponent])]

  const { data } = useSuspenseQuery(
    counterpicksQueryOptions({
      period,
      league: search.league,
      controls: search.controls,
      target: search.character,
      threats,
    }),
  )

  const toggleThreat = (characterId: CharacterId): void => {
    setThreatSelection((previous) => {
      const previousThreats =
        previous.character === search.character && previous.opponent === search.opponent
          ? previous.threats
          : [...new Set([search.character, search.opponent])]
      if (previousThreats.includes(characterId)) {
        const next = previousThreats.filter((id) => id !== characterId)
        return {
          character: search.character,
          opponent: search.opponent,
          threats: next.length === 0 ? [characterId] : next,
        }
      }
      return previousThreats.length >= 8
        ? previous
        : {
            character: search.character,
            opponent: search.opponent,
            threats: [...previousThreats, characterId],
          }
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <AnalyticsPanel
        title="Threat picker"
        description="Choose up to eight characters to cover with one counterpick"
      >
        <div className="flex flex-wrap gap-1.5">
          {meta.characters.map((character) => {
            const selected = threats.includes(character.id)
            return (
              <button
                key={character.id}
                type="button"
                onClick={() => {
                  toggleThreat(character.id)
                }}
                className={`flex items-center gap-1 border px-2 py-1 text-xs transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {selected ? <X className="size-3" /> : <Plus className="size-3" />}
                {character.name}
              </button>
            )
          })}
        </div>
      </AnalyticsPanel>

      <AnalyticsPanel
        title="Counterpick coverage"
        description={`${data.rows.length} available picks · sorted by average win rate across selected threats`}
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Pick</TableHead>
              <TableHead scope="col" className="text-right">
                Average
              </TableHead>
              <TableHead scope="col" className="text-right">
                Worst
              </TableHead>
              <TableHead scope="col" className="text-right">
                Covered
              </TableHead>
              {data.threats.map((threatId) => (
                <TableHead key={threatId} scope="col" className="text-right">
                  {meta.characters.find((character) => character.id === threatId)?.short}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.slice(0, 12).map((row) => (
              <TableRow
                key={row.characterId}
                className="cursor-pointer"
                onClick={() => {
                  onChange({ character: row.characterId })
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CharacterBadge characterId={row.characterId} size="small" />
                    <CharacterName characterId={row.characterId} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.averageWinRate} />
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.worstWinRate} />
                </TableCell>
                <TableCell className="text-right font-mono">{row.coveredCount}</TableCell>
                {data.threats.map((threatId) => (
                  <TableCell key={threatId} className="text-right">
                    <WinRate
                      value={
                        row.matchups.find((matchup) => matchup.opponentId === threatId)?.winRate ??
                        null
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </div>
  )
}

export { CounterpickView }
