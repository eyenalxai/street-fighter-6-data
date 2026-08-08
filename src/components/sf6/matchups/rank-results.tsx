import type { SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { MatchupExplorerData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import { compareNumbers, compareRankIds, createTableSortFn } from "@/lib/sf6/table-sorting"

type RankData = Extract<MatchupExplorerData, { view: "ranks" }>
type RankRow = RankData["rankProgression"][number]

const MATCHUP_RANK_INITIAL_SORTING = [{ id: "rank", desc: false }]

const matchupRankColumns: SortableColumnDef<RankRow>[] = [
  {
    id: "rank",
    accessorFn: (row) => row.id,
    header: "Rank",
    sortFn: createTableSortFn(compareRankIds),
    cell: ({ row }) => row.original.label,
  },
  {
    id: "winRate",
    accessorFn: (row) => row.winRate ?? undefined,
    header: "Win rate",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.winRate} format="percent" tone="winRate" />,
  },
]

const MatchupRankResults = ({ data }: { data: RankData }) => (
  <AnalyticsPanel
    title="Matchup across ranks"
    description="Combined controls keep standard ranks comparable with Master subdivisions."
    contentClassName="p-0"
  >
    <SortableDataTable
      data={data.rankProgression}
      columns={matchupRankColumns}
      initialSorting={MATCHUP_RANK_INITIAL_SORTING}
      getRowId={(row) => row.id}
    />
  </AnalyticsPanel>
)

export { MatchupRankResults }
