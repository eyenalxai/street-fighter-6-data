import type { SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { RosterOverviewData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricTrendChart } from "@/components/sf6/charts/metric-trend-chart"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import { compareNumbers, compareRankIds, createTableSortFn } from "@/lib/sf6/table-sorting"

type RankData = Extract<RosterOverviewData, { view: "ranks" }>
type RankRow = RankData["rankLandscape"][number]

const ROSTER_RANK_INITIAL_SORTING = [{ id: "rank", desc: false }]

const rosterRankColumns: SortableColumnDef<RankRow>[] = [
  {
    id: "rank",
    accessorFn: (row) => row.rankId,
    header: "Rank",
    sortFn: createTableSortFn(compareRankIds),
    cell: ({ row }) => row.original.label,
  },
  {
    id: "averageWinRateSpread",
    accessorFn: (row) => row.averageWinRateSpread ?? undefined,
    header: "Win rate spread",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.averageWinRateSpread} format="percentagePoints" />
    ),
  },
  {
    id: "effectiveRosterSize",
    accessorFn: (row) => row.effectiveRosterSize ?? undefined,
    header: "Effective roster size",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.effectiveRosterSize} format="number" />,
  },
  {
    id: "topFiveShare",
    accessorFn: (row) => row.topFiveShare ?? undefined,
    header: "Top-five usage",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.topFiveShare} format="percent" />,
  },
]

const RosterRankResults = ({ data }: { data: RankData }) => {
  const chartData = data.rankLandscape.map((point) => {
    return {
      label: point.label,
      spread: point.averageWinRateSpread,
      diversity: point.effectiveRosterSize,
    }
  })
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <AnalyticsPanel
          title="Win rate spread across ranks"
          description="Each point is the highest character average minus the lowest character average at that rank."
        >
          <MetricTrendChart
            data={chartData}
            series={[{ key: "spread", label: "Win rate spread", color: "var(--chart-1)" }]}
            xAxisLabel="Rank"
            valueFormat="percentagePoints"
            valueLabel="Win rate spread (percentage points)"
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Effective roster size across ranks"
          description="Higher values indicate a more diverse usage environment at that rank."
        >
          <MetricTrendChart
            data={chartData}
            series={[{ key: "diversity", label: "Effective roster size", color: "var(--chart-2)" }]}
            xAxisLabel="Rank"
            valueFormat="number"
            valueLabel="Effective roster size (characters)"
          />
        </AnalyticsPanel>
      </div>
      <AnalyticsPanel
        title="Rank landscape"
        description="The selected period's spread and usage concentration at each rank."
        contentClassName="p-0"
      >
        <SortableDataTable
          data={data.rankLandscape}
          columns={rosterRankColumns}
          initialSorting={ROSTER_RANK_INITIAL_SORTING}
          getRowId={(row) => row.rankId}
        />
      </AnalyticsPanel>
    </div>
  )
}

export { RosterRankResults }
