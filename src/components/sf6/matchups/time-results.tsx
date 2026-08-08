import type { SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { MatchupExplorerData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import { formatReportingPeriod } from "@/lib/sf6/model"
import { compareNumbers, compareReportingPeriods, createTableSortFn } from "@/lib/sf6/table-sorting"

type TimeData = Extract<MatchupExplorerData, { view: "time" }>
type TimeRow = TimeData["timeProgression"][number]

const MATCHUP_TIME_INITIAL_SORTING = [{ id: "period", desc: false }]

const matchupTimeColumns: SortableColumnDef<TimeRow>[] = [
  {
    id: "period",
    accessorFn: (row) => row.period,
    header: "Reporting period",
    sortFn: createTableSortFn(compareReportingPeriods),
    cell: ({ row }) => formatReportingPeriod(row.original.period),
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

const MatchupTimeResults = ({ data }: { data: TimeData }) => (
  <AnalyticsPanel
    title="Matchup over time"
    description="Each row uses the selected control matchup. Unavailable results stay blank."
    contentClassName="p-0"
  >
    <SortableDataTable
      data={data.timeProgression}
      columns={matchupTimeColumns}
      initialSorting={MATCHUP_TIME_INITIAL_SORTING}
      getRowId={(row) => row.period}
    />
  </AnalyticsPanel>
)

export { MatchupTimeResults }
