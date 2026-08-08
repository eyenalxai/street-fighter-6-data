import { useState } from "react"

import type { SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { CharacterExplorerData, MetaData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { MetricTrendChart } from "@/components/sf6/charts/metric-trend-chart"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatCompactReportingPeriodTick } from "@/lib/sf6/charts/format"
import { formatReportingPeriod } from "@/lib/sf6/model"
import { AXIS_LABELS } from "@/lib/sf6/presentation"
import {
  compareCharacterIds,
  compareNumbers,
  compareReportingPeriods,
  createTableSortFn,
} from "@/lib/sf6/table-sorting"

type TimeData = Extract<CharacterExplorerData, { view: "time" }>
type TimeRow = TimeData["series"][number]

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const CHARACTER_TIME_INITIAL_SORTING = [{ id: "character", desc: false }]

const characterTimeColumns: SortableColumnDef<TimeRow>[] = [
  {
    id: "character",
    accessorFn: (row) => row.characterId,
    header: "Character",
    sortFn: createTableSortFn(compareCharacterIds),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CharacterBadge characterId={row.original.characterId} size="small" />
        <CharacterName characterId={row.original.characterId} />
      </div>
    ),
  },
  {
    id: "firstPeriod",
    accessorFn: (row) => row.stability.firstPeriod ?? undefined,
    header: "First recorded",
    sortFn: createTableSortFn(compareReportingPeriods),
    sortUndefined: "last",
    cell: ({ row }) =>
      row.original.stability.firstPeriod === null
        ? "—"
        : formatReportingPeriod(row.original.stability.firstPeriod),
  },
  {
    id: "averageWinRateRange",
    accessorFn: (row) => row.stability.averageWinRateRange ?? undefined,
    header: "Win rate range",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.stability.averageWinRateRange} format="percentagePoints" />
    ),
  },
  {
    id: "averageWinRateStandardDeviation",
    accessorFn: (row) => row.stability.averageWinRateStandardDeviation ?? undefined,
    header: "Win rate deviation",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue
        value={row.original.stability.averageWinRateStandardDeviation}
        format="percentagePoints"
      />
    ),
  },
  {
    id: "usageRange",
    accessorFn: (row) => row.stability.usageRange ?? undefined,
    header: "Usage range",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.stability.usageRange} format="percentagePoints" />
    ),
  },
  {
    id: "usageStandardDeviation",
    accessorFn: (row) => row.stability.usageStandardDeviation ?? undefined,
    header: "Usage deviation",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue
        value={row.original.stability.usageStandardDeviation}
        format="percentagePoints"
      />
    ),
  },
]

const CharacterTimeResults = ({ data, meta }: { data: TimeData; meta: MetaData }) => {
  const [averageWinRateMetric, setAverageWinRateMetric] = useState<"unweighted" | "weighted">(
    "unweighted",
  )
  const points = data.series[0]?.points ?? []
  const averageWinRateData = points.map((point, index) => {
    const row: { label: string; [key: string]: number | string | null } = {
      label: formatReportingPeriod(point.period),
    }
    for (const series of data.series) {
      const seriesPoint = series.points[index]
      row[series.characterId] =
        averageWinRateMetric === "weighted"
          ? (seriesPoint?.weightedAverageWinRate ?? null)
          : (seriesPoint?.averageWinRate ?? null)
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
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <AnalyticsPanel
          title="Average win rate over time"
          description="Switch between the unweighted average and a usage-share-weighted estimate. Missing characters stay blank."
          action={
            <ToggleGroup
              value={[averageWinRateMetric]}
              onValueChange={(value) => {
                const next = value[0]
                if (next === "unweighted" || next === "weighted") {
                  setAverageWinRateMetric(next)
                }
              }}
              variant="outline"
              size="sm"
              spacing={0}
              aria-label="Average win rate metric"
            >
              <ToggleGroupItem value="unweighted">Unweighted</ToggleGroupItem>
              <ToggleGroupItem value="weighted">Usage-weighted</ToggleGroupItem>
            </ToggleGroup>
          }
        >
          <MetricTrendChart
            data={averageWinRateData}
            series={series.map((item) => {
              return {
                ...item,
                label:
                  averageWinRateMetric === "weighted"
                    ? `${item.label} weighted`
                    : `${item.label} average`,
              }
            })}
            xAxisLabel={AXIS_LABELS.reportingPeriod}
            valueFormat="percent"
            valueLabel={
              averageWinRateMetric === "weighted"
                ? "Usage-weighted average win rate"
                : AXIS_LABELS.averageWinRate
            }
            referenceValue={50}
            referenceLabel="50%"
            xTickFormatter={formatCompactReportingPeriodTick}
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Usage share over time"
          description="Character usage share in the selected rank and player-control population."
        >
          <MetricTrendChart
            data={usageData}
            series={series}
            xAxisLabel={AXIS_LABELS.reportingPeriod}
            valueFormat="percent"
            valueLabel={AXIS_LABELS.usageShare}
            xTickFormatter={formatCompactReportingPeriodTick}
          />
        </AnalyticsPanel>
      </div>
      <AnalyticsPanel
        title="Character stability"
        description="Range and standard deviation show change across the reporting period series."
        contentClassName="p-0"
      >
        <SortableDataTable
          data={data.series}
          columns={characterTimeColumns}
          initialSorting={CHARACTER_TIME_INITIAL_SORTING}
          getRowId={(row) => row.characterId}
        />
      </AnalyticsPanel>
    </div>
  )
}

export { CharacterTimeResults }
