import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"

import type { DashboardViewProps } from "@/components/sf6/dashboard"
import type { ReportingPeriod } from "@/lib/sf6/model"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { ChartFrame } from "@/components/sf6/chart-frame"
import { LabeledSelect } from "@/components/sf6/labeled-select"
import { DeltaValue, WinRate } from "@/components/sf6/win-rate"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatReportingPeriod, ReportingPeriodSchema } from "@/lib/sf6/model"
import { periodComparisonQueryOptions } from "@/lib/sf6/query-options"

const CHART_MARGIN = { top: 8, right: 16, left: -12, bottom: 52 }
const AXIS_TICK = { fontSize: 10, fill: "var(--muted-foreground)" }
const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  color: "var(--popover-foreground)",
  fontSize: "12px",
}

type PeriodSelection = {
  source: ReportingPeriod
  from: ReportingPeriod
  to: ReportingPeriod
}

const parsePeriod = (value: string): ReportingPeriod | undefined => {
  const parsed = ReportingPeriodSchema.safeParse(value)
  return parsed.success ? parsed.data : undefined
}

const DateComparisonView = ({ period, search, meta }: DashboardViewProps) => {
  const [periodSelection, setPeriodSelection] = useState<PeriodSelection>({
    source: period,
    from: meta.periods[0] ?? period,
    to: period,
  })
  const fromPeriod = periodSelection.from
  const toPeriod = periodSelection.source === period ? periodSelection.to : period

  const { data } = useSuspenseQuery(
    periodComparisonQueryOptions({
      fromPeriod,
      toPeriod,
      league: search.league,
      controls: search.controls,
    }),
  )
  const changedRows = data.rows.filter((row) => row.delta !== null)
  const rose = changedRows.filter((row) => (row.delta ?? 0) > 0).length
  const fell = changedRows.filter((row) => (row.delta ?? 0) < 0).length
  const biggest = changedRows.toSorted(
    (left, right) => Math.abs(right.delta ?? 0) - Math.abs(left.delta ?? 0),
  )[0]
  const chartRows = data.rows.map((row) => {
    return {
      ...row,
      short:
        meta.characters.find((character) => character.id === row.characterId)?.short ??
        row.characterId,
      chartDelta: row.delta ?? 0,
      positiveDelta: Math.max(0, row.delta ?? 0),
      negativeDelta: Math.min(0, row.delta ?? 0),
    }
  })

  const updateFromPeriod = (value: string): void => {
    const next = parsePeriod(value)
    if (next !== undefined) {
      setPeriodSelection((previous) => {
        return { ...previous, source: period, from: next }
      })
    }
  }
  const updateToPeriod = (value: string): void => {
    const next = parsePeriod(value)
    if (next !== undefined) {
      setPeriodSelection((previous) => {
        return { ...previous, source: period, to: next }
      })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <AnalyticsPanel
        title="Compare reporting periods"
        description="Change in matchup average between two snapshots"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <LabeledSelect
            label="From"
            value={fromPeriod}
            options={meta.periods.map((value) => {
              return { value, label: formatReportingPeriod(value) }
            })}
            onChange={(value) => {
              updateFromPeriod(value)
            }}
          />
          <LabeledSelect
            label="To"
            value={toPeriod}
            options={meta.periods.map((value) => {
              return { value, label: formatReportingPeriod(value) }
            })}
            onChange={(value) => {
              updateToPeriod(value)
            }}
          />
        </div>
      </AnalyticsPanel>

      <div className="grid gap-4 sm:grid-cols-3">
        <AnalyticsPanel title="Rose" description="Characters with a positive delta">
          <p className="font-mono text-2xl">{rose}</p>
        </AnalyticsPanel>
        <AnalyticsPanel title="Fell" description="Characters with a negative delta">
          <p className="font-mono text-2xl">{fell}</p>
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Biggest swing"
          description={
            biggest ? <CharacterName characterId={biggest.characterId} /> : "No comparison"
          }
        >
          <DeltaValue value={biggest?.delta ?? null} className="text-2xl" />
        </AnalyticsPanel>
      </div>

      <AnalyticsPanel
        title="Period delta"
        description={`${formatReportingPeriod(fromPeriod)} → ${formatReportingPeriod(toPeriod)}`}
      >
        <ChartFrame className="h-[360px]">
          <BarChart data={chartRows} margin={CHART_MARGIN}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="short" tick={AXIS_TICK} angle={-45} textAnchor="end" height={60} />
            <YAxis domain={[-10, 10]} tick={AXIS_TICK} tickFormatter={(value) => `${value}`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="positiveDelta" name="Positive delta" fill="var(--wr-strong)" />
            <Bar dataKey="negativeDelta" name="Negative delta" fill="var(--wr-weak)" />
          </BarChart>
        </ChartFrame>
      </AnalyticsPanel>

      <AnalyticsPanel title="All changes" contentClassName="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Character</TableHead>
              <TableHead scope="col" className="text-right">
                Before
              </TableHead>
              <TableHead scope="col" className="text-right">
                After
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
                  <WinRate value={row.before} />
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.after} />
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
  )
}

export { DateComparisonView }
