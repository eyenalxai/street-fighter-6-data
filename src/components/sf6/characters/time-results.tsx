import { useState } from "react"

import type { CharacterExplorerData, MetaData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { MetricTrendChart } from "@/components/sf6/charts/metric-trend-chart"
import { MetricValue } from "@/components/sf6/metric-value"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatReportingPeriod } from "@/lib/sf6/model"

type TimeData = Extract<CharacterExplorerData, { mode: "time" }>

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const CharacterTimeResults = ({ data, meta }: { data: TimeData; meta: MetaData }) => {
  const [performanceMetric, setPerformanceMetric] = useState<"unweighted" | "weighted">(
    "unweighted",
  )
  const points = data.series[0]?.points ?? []
  const performanceData = points.map((point, index) => {
    const row: { label: string; [key: string]: number | string | null } = {
      label: formatReportingPeriod(point.period),
    }
    for (const series of data.series) {
      const seriesPoint = series.points[index]
      row[series.characterId] =
        performanceMetric === "weighted"
          ? (seriesPoint?.weightedPerformance ?? null)
          : (seriesPoint?.performance ?? null)
    }
    return row
  })
  const usageData = points.map((point, index) => {
    const row: { label: string; [key: string]: number | string | null } = {
      label: formatReportingPeriod(point.period),
    }
    for (const series of data.series) {
      row[series.characterId] = series.points[index]?.usage ?? null
    }
    return row
  })
  const series = data.series.map((item, index) => {
    return {
      key: item.characterId,
      label:
        meta.characters.find((character) => character.id === item.characterId)?.name ??
        item.characterId,
      color: COLORS[index % COLORS.length] ?? "var(--chart-1)",
    }
  })
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsPanel
          title="Performance over time"
          description="Toggle between the unweighted character average and an opponent-popularity-weighted estimate. Missing historical characters remain gaps."
        >
          <ToggleGroup
            value={[performanceMetric]}
            onValueChange={(value) => {
              const next = value[0]
              if (next === "unweighted" || next === "weighted") {
                setPerformanceMetric(next)
              }
            }}
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="Performance metric"
            className="mb-3"
          >
            <ToggleGroupItem value="unweighted">Unweighted</ToggleGroupItem>
            <ToggleGroupItem value="weighted">Popularity-weighted</ToggleGroupItem>
          </ToggleGroup>
          <MetricTrendChart
            data={performanceData}
            series={series.map((item) => {
              return {
                ...item,
                label:
                  performanceMetric === "weighted"
                    ? `${item.label} weighted`
                    : `${item.label} average`,
              }
            })}
            xAxisLabel="Reporting period"
            valueFormat="percent"
            valueLabel={
              performanceMetric === "weighted"
                ? "Popularity-weighted performance"
                : "Average win rate"
            }
            referenceValue={50}
            referenceLabel="50%"
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Popularity over time"
          description="Character usage share within the selected rank and player-control population."
        >
          <MetricTrendChart
            data={usageData}
            series={series}
            xAxisLabel="Reporting period"
            valueFormat="percent"
            valueLabel="Usage share"
          />
        </AnalyticsPanel>
      </div>
      <AnalyticsPanel
        title="Character stability"
        description="Range and standard deviation describe volatility across the selected monthly series."
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Character</TableHead>
              <TableHead>First recorded</TableHead>
              <TableHead className="text-right">Performance range</TableHead>
              <TableHead className="text-right">Performance deviation</TableHead>
              <TableHead className="text-right">Usage range</TableHead>
              <TableHead className="text-right">Usage deviation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.series.map((row) => (
              <TableRow key={row.characterId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CharacterBadge characterId={row.characterId} size="small" />
                    <CharacterName characterId={row.characterId} />
                  </div>
                </TableCell>
                <TableCell>
                  {row.stability.firstPeriod === null
                    ? "—"
                    : formatReportingPeriod(row.stability.firstPeriod)}
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.stability.performanceRange} format="percentagePoints" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue
                    value={row.stability.performanceStandardDeviation}
                    format="percentagePoints"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.stability.usageRange} format="percentagePoints" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue
                    value={row.stability.usageStandardDeviation}
                    format="percentagePoints"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </div>
  )
}

export { CharacterTimeResults }
