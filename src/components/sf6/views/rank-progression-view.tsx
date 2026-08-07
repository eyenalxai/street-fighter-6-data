import { useSuspenseQuery } from "@tanstack/react-query"
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"

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
import { rankProgressionQueryOptions } from "@/lib/sf6/query-options"

const CHART_MARGIN = { top: 8, right: 16, left: -12, bottom: 8 }
const AXIS_TICK = { fontSize: 11, fill: "var(--muted-foreground)" }
const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  color: "var(--popover-foreground)",
  fontSize: "12px",
}

const RankProgressionView = ({ period, search, meta }: DashboardViewProps) => {
  const { data } = useSuspenseQuery(
    rankProgressionQueryOptions({
      period,
      league: search.league,
      controls: search.controls,
      character: search.character,
    }),
  )
  const first = data.points.find((point) => point.winRate !== null)?.winRate ?? null
  const last = data.points.toReversed().find((point) => point.winRate !== null)?.winRate ?? null
  const spread = data.heatmap[0]?.spread ?? null

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <AnalyticsPanel
          title="Matchup average by rank"
          description={`Selected character · ${meta.characters.find((character) => character.id === search.character)?.name ?? search.character}`}
        >
          <ChartFrame>
            <AreaChart data={data.points} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="rank-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={AXIS_TICK} />
              <YAxis domain={[40, 60]} tick={AXIS_TICK} tickFormatter={(value) => `${value}%`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="winRate"
                stroke="var(--chart-2)"
                fill="url(#rank-fill)"
                connectNulls
              />
            </AreaChart>
          </ChartFrame>
        </AnalyticsPanel>

        <AnalyticsPanel title="Rank scaling" description="Change from the lowest to highest rank">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                Rookie → Master
              </p>
              <DeltaValue
                value={first === null || last === null ? null : last - first}
                className="text-lg"
              />
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                Rank spread across roster
              </p>
              <WinRate value={spread} className="text-lg" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {data.points.map((point) => (
                <div
                  key={point.leagueId}
                  className="flex items-center justify-between border-b border-border/60 py-1"
                >
                  <span className="text-xs text-muted-foreground">{point.label}</span>
                  <WinRate value={point.winRate} />
                </div>
              ))}
            </div>
          </div>
        </AnalyticsPanel>
      </div>

      <AnalyticsPanel
        title="Rank heatmap"
        description="Characters sorted by matchup-average spread across ranks"
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Character</TableHead>
              {data.heatmap[0]?.points.map((point) => (
                <TableHead key={point.leagueId} scope="col" className="text-right">
                  {point.label}
                </TableHead>
              ))}
              <TableHead scope="col" className="text-right">
                Spread
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.heatmap.map((row) => (
              <TableRow key={row.characterId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CharacterBadge characterId={row.characterId} size="small" />
                    <CharacterName characterId={row.characterId} />
                  </div>
                </TableCell>
                {row.points.map((point) => (
                  <TableCell key={point.leagueId} className="text-right">
                    <WinRate value={point.winRate} />
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <WinRate value={row.spread} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </div>
  )
}

export { RankProgressionView }
