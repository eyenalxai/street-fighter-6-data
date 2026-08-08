import type { SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { CharacterExplorerData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { MetricTrendChart } from "@/components/sf6/charts/metric-trend-chart"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import { buildCharacterMetricTrendData, buildCharacterTrendSeries } from "@/lib/sf6/charts/series"
import { AXIS_LABELS, getRankLabel } from "@/lib/sf6/presentation"
import {
  compareCharacterIds,
  compareNumbers,
  compareRankIds,
  createTableSortFn,
} from "@/lib/sf6/table-sorting"

type RankData = Extract<CharacterExplorerData, { view: "ranks" }>
type RankRow = RankData["series"][number]

const CHARACTER_RANK_INITIAL_SORTING = [{ id: "character", desc: false }]

const characterRankColumns: SortableColumnDef<RankRow>[] = [
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
    id: "averageWinRateRange",
    accessorFn: (row) => row.averageWinRateRange ?? undefined,
    header: "Win rate range",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.averageWinRateRange} format="percentagePoints" />
    ),
  },
  {
    id: "usageRange",
    accessorFn: (row) => row.usageRange ?? undefined,
    header: "Usage share range",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.usageRange} format="percentagePoints" />,
  },
  {
    id: "peakRankId",
    accessorFn: (row) => row.peakRankId ?? undefined,
    header: "Peak rank",
    sortFn: createTableSortFn(compareRankIds),
    sortUndefined: "last",
    cell: ({ row }) =>
      row.original.peakRankId === null ? "—" : getRankLabel(row.original.peakRankId),
  },
  {
    id: "troughRankId",
    accessorFn: (row) => row.troughRankId ?? undefined,
    header: "Trough rank",
    sortFn: createTableSortFn(compareRankIds),
    sortUndefined: "last",
    cell: ({ row }) =>
      row.original.troughRankId === null ? "—" : getRankLabel(row.original.troughRankId),
  },
]

const CharacterRankResults = ({ data }: { data: RankData }) => {
  const averageWinRateData = buildCharacterMetricTrendData(
    data.series,
    (point) => point.label,
    (point) => point?.averageWinRate ?? null,
  )
  const usageData = buildCharacterMetricTrendData(
    data.series,
    (point) => point.label,
    (point) => point?.usage ?? null,
  )
  const chartSeries = buildCharacterTrendSeries(data.series)
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <AnalyticsPanel
          title="Average win rate across ranks"
          description="Combined-control average win rate from Rookie through the available Master subdivisions."
        >
          <MetricTrendChart
            data={averageWinRateData}
            series={chartSeries}
            xAxisLabel={AXIS_LABELS.rank}
            valueFormat="percent"
            valueLabel={AXIS_LABELS.averageWinRate}
            referenceValue={50}
            referenceLabel="50%"
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Usage share across ranks"
          description="Combined-control usage share for the same character and rank sequence."
        >
          <MetricTrendChart
            data={usageData}
            series={chartSeries}
            xAxisLabel={AXIS_LABELS.rank}
            valueFormat="percent"
            valueLabel={AXIS_LABELS.usageShare}
          />
        </AnalyticsPanel>
      </div>
      <AnalyticsPanel
        title="Rank progression summary"
        description="Each range is the maximum minus the minimum across the displayed ranks."
        contentClassName="p-0"
      >
        <SortableDataTable
          data={data.series}
          columns={characterRankColumns}
          initialSorting={CHARACTER_RANK_INITIAL_SORTING}
          getRowId={(row) => row.characterId}
        />
      </AnalyticsPanel>
    </div>
  )
}

export { CharacterRankResults }
