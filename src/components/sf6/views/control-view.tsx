import { useSuspenseQuery } from "@tanstack/react-query"
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"

import type { DashboardViewProps } from "@/components/sf6/dashboard"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { ChartFrame } from "@/components/sf6/chart-frame"
import { DeltaValue, WinRate } from "@/components/sf6/win-rate"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { controlComparisonQueryOptions } from "@/lib/sf6/query-options"

const CHART_MARGIN = { top: 8, right: 16, left: -12, bottom: 52 }
const AXIS_TICK = { fontSize: 10, fill: "var(--muted-foreground)" }
const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  color: "var(--popover-foreground)",
  fontSize: "12px",
}

const ControlView = ({ period, search, meta }: DashboardViewProps) => {
  const { data } = useSuspenseQuery(
    controlComparisonQueryOptions({
      period,
      league: search.league,
    }),
  )
  const selected = data.rows.find((row) => row.characterId === search.character)
  const chartRows = data.rows.map((row) => {
    return {
      ...row,
      name:
        meta.characters.find((character) => character.id === row.characterId)?.short ??
        row.characterId,
      positiveDelta: Math.max(0, row.delta ?? 0),
      negativeDelta: Math.min(0, row.delta ?? 0),
    }
  })

  return (
    <div className="flex flex-col gap-5">
      <AnalyticsPanel
        title="Classic vs Modern"
        description={`Balanced control matchup averages at ${meta.leagues.find((league) => league.id === search.league)?.label ?? "rank"} · each player control averages both opponent controls`}
      >
        <ChartFrame className="h-[360px]">
          <BarChart data={chartRows} margin={CHART_MARGIN}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={AXIS_TICK} angle={-45} textAnchor="end" height={60} />
            <YAxis domain={[-10, 10]} tick={AXIS_TICK} tickFormatter={(value) => `${value}`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="positiveDelta" name="Modern − Classic" fill="var(--wr-strong)" />
            <Bar dataKey="negativeDelta" name="Modern − Classic" fill="var(--wr-weak)" />
          </BarChart>
        </ChartFrame>
      </AnalyticsPanel>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <AnalyticsPanel title="Selected character" description="Balanced player-control averages">
          <div className="flex items-center gap-3">
            <CharacterBadge characterId={search.character} />
            <div>
              <p className="font-medium">
                <CharacterName characterId={search.character} />
              </p>
              <p className="text-xs text-muted-foreground">Classic → Modern</p>
            </div>
            <DeltaValue value={selected?.delta ?? null} className="ml-auto text-lg" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3">
            <div>
              <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                Classic
              </p>
              <WinRate value={selected?.classic ?? null} />
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                Modern
              </p>
              <WinRate value={selected?.modern ?? null} />
            </div>
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel
          title="Control breakdown"
          description="All characters, sorted by the Modern minus Classic delta"
          contentClassName="p-0"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Character</TableHead>
                <TableHead scope="col" className="text-right">
                  Classic
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Modern
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Delta
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row) => (
                <TableRow key={row.characterId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CharacterBadge characterId={row.characterId} size="small" />
                      <CharacterName characterId={row.characterId} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <WinRate value={row.classic} />
                  </TableCell>
                  <TableCell className="text-right">
                    <WinRate value={row.modern} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DeltaValue value={row.delta} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AnalyticsPanel>
      </div>
    </div>
  )
}

export { ControlView }
