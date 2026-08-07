import { useSuspenseQuery } from "@tanstack/react-query"
import { Plus, X } from "lucide-react"
import { useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts"

import type { DashboardViewProps } from "@/components/sf6/dashboard"
import type { CharacterId } from "@/lib/sf6/model"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { ChartFrame } from "@/components/sf6/chart-frame"
import { formatReportingPeriod } from "@/lib/sf6/model"
import { trendsQueryOptions } from "@/lib/sf6/query-options"
import { cn } from "@/lib/utils"

const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]
const SERIES_STYLES = SERIES_COLORS.map((backgroundColor) => {
  return { backgroundColor }
})
const CHART_MARGIN = { top: 8, right: 16, left: -12, bottom: 24 }
const AXIS_TICK = { fontSize: 11, fill: "var(--muted-foreground)" }
const X_AXIS_TICK = { fontSize: 10, fill: "var(--muted-foreground)" }
const ACTIVE_DOT = { r: 4 }
const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  color: "var(--popover-foreground)",
  fontSize: "12px",
}

const TrendView = ({ search, meta }: DashboardViewProps) => {
  const [selection, setSelection] = useState({
    character: search.character,
    selected: [search.character],
  })
  const active =
    selection.character === search.character ? selection.selected.slice(0, 5) : [search.character]
  const { data } = useSuspenseQuery(
    trendsQueryOptions({
      league: search.league,
      controls: search.controls,
      characters: active,
    }),
  )
  const chartData = useMemo(() => {
    const points = data.series[0]?.points ?? []
    return points.map((point, index) => {
      const row: Record<string, number | string | null> = {
        period: formatReportingPeriod(point.period),
      }
      for (const series of data.series) {
        row[series.characterId] = series.points[index]?.winRate ?? null
      }
      return row
    })
  }, [data.series])

  const toggle = (characterId: CharacterId): void => {
    setSelection((previous) => {
      const previousSelected =
        previous.character === search.character ? previous.selected : [search.character]
      if (previousSelected.includes(characterId)) {
        return {
          character: search.character,
          selected: previousSelected.filter((id) => id !== characterId),
        }
      }
      return previousSelected.length >= 5
        ? { character: search.character, selected: previousSelected }
        : { character: search.character, selected: [...previousSelected, characterId] }
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <AnalyticsPanel
        title="Matchup average over time"
        description={`Monthly matchup average at ${meta.leagues.find((league) => league.id === search.league)?.label ?? "rank"} · controls: ${search.controls}`}
      >
        <ChartFrame className="h-[380px]">
          <LineChart data={chartData} margin={CHART_MARGIN}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="period"
              tick={X_AXIS_TICK}
              angle={-40}
              textAnchor="end"
              height={50}
              interval={0}
            />
            <YAxis domain={[35, 65]} tick={AXIS_TICK} tickFormatter={(value) => `${value}%`} />
            <ReferenceLine y={50} stroke="var(--muted-foreground)" strokeDasharray="2 2" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {data.series.map((series, index) => (
              <Line
                key={series.characterId}
                type="monotone"
                dataKey={series.characterId}
                name={
                  meta.characters.find((character) => character.id === series.characterId)?.name
                }
                stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={ACTIVE_DOT}
                connectNulls
              />
            ))}
          </LineChart>
        </ChartFrame>
        <div className="mt-2 flex flex-wrap gap-2">
          {active.map((characterId, index) => (
            <span
              key={characterId}
              className="flex items-center gap-1.5 border border-border bg-secondary px-2 py-0.5 text-xs"
            >
              <span className="size-2" style={SERIES_STYLES[index % SERIES_STYLES.length]} />
              {meta.characters.find((character) => character.id === characterId)?.name}
              {characterId === search.character ? null : (
                <button
                  type="button"
                  onClick={() => {
                    toggle(characterId)
                  }}
                  aria-label="Remove character"
                >
                  <X className="size-3 text-muted-foreground" />
                </button>
              )}
            </span>
          ))}
        </div>
      </AnalyticsPanel>

      <AnalyticsPanel
        title="Compare characters"
        description="Add up to five characters to the trend chart"
      >
        <div className="flex flex-wrap gap-1.5">
          {meta.characters.map((character) => {
            const isSelected = active.includes(character.id)
            const isLocked = character.id === search.character
            return (
              <button
                key={character.id}
                type="button"
                disabled={isLocked}
                onClick={() => {
                  toggle(character.id)
                }}
                className={cn(
                  "flex items-center gap-1 border px-2 py-1 text-xs font-medium transition-colors",
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                  isLocked && "opacity-70",
                )}
              >
                {isSelected ? null : <Plus className="size-3" />}
                {character.name}
              </button>
            )
          })}
        </div>
      </AnalyticsPanel>
    </div>
  )
}

export { TrendView }
