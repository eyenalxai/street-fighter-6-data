import type { SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { MetaData, RosterOverviewData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricTrendChart } from "@/components/sf6/charts/metric-trend-chart"
import { MetricValue } from "@/components/sf6/metric-value"
import { RankConsistencyTable } from "@/components/sf6/roster/consistency-tables"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import { WIN_RATE_SPREAD_SERIES } from "@/lib/sf6/charts/series"
import { AXIS_LABELS, METRIC_LABELS } from "@/lib/sf6/presentation"
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
    header: METRIC_LABELS.winRateSpread,
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.averageWinRateSpread} format="percentagePoints" />
    ),
  },
  {
    id: "topFiveShare",
    accessorFn: (row) => row.topFiveShare ?? undefined,
    header: METRIC_LABELS.topFiveUsage,
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.topFiveShare} format="percent" />,
  },
]

const RosterRankResults = ({ data, meta }: { data: RankData; meta: MetaData }) => {
  const chartData = data.rankLandscape.map((point) => {
    return {
      label: point.label,
      spread: point.averageWinRateSpread,
    }
  })
  return (
    <div className="flex flex-col gap-4">
      <AnalyticsPanel
        title="Win rate spread across ranks"
        description="Each point shows the highest character average win rate minus the lowest at that rank."
        contentInset="none"
      >
        <MetricTrendChart
          data={chartData}
          series={[WIN_RATE_SPREAD_SERIES]}
          xAxisName={AXIS_LABELS.rank}
          valueFormat="percentagePoints"
          yAxisName="Win rate spread (percentage points)"
        />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Rank landscape"
        description="Win rate spread and top-five usage share for the selected reporting period."
        contentInset="none"
      >
        <SortableDataTable
          data={data.rankLandscape}
          columns={rosterRankColumns}
          initialSorting={ROSTER_RANK_INITIAL_SORTING}
          getRowId={(row) => row.rankId}
        />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Character consistency across ranks"
        description="Lower win rate ranges show characters with a steadier average win rate across ranks."
        contentInset="none"
      >
        <RankConsistencyTable data={data.characterConsistency} meta={meta} />
      </AnalyticsPanel>
    </div>
  )
}

export { RosterRankResults }
