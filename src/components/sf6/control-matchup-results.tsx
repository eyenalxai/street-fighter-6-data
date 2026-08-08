import type { SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { ControlMatchup } from "@/lib/sf6/model"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { MASTER_SUBDIVISION_PAIRING_UNAVAILABLE } from "@/lib/sf6/presentation"
import { compareNumbers, compareStrings, createTableSortFn } from "@/lib/sf6/table-sorting"

type ControlMatchupRow = {
  controlMatchup: Exclude<ControlMatchup, "combined">
  label: string
  winRate: number | null
}

const CONTROL_MATCHUP_INITIAL_SORTING = [{ id: "controlMatchup", desc: false }]

const controlMatchupColumns: SortableColumnDef<ControlMatchupRow>[] = [
  {
    id: "controlMatchup",
    accessorFn: (row) => row.label,
    header: "Control pairing",
    sortFn: createTableSortFn(compareStrings),
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

const ControlMatchupResults = ({ rows }: { rows: readonly ControlMatchupRow[] }) => (
  <AnalyticsPanel
    title="Reported win rate by control pairing"
    description="Each row shows the reported result for one player-control and opponent-control pairing."
  >
    {rows.length === 0 ? (
      <Empty className="min-h-32">
        <EmptyHeader>
          <EmptyTitle>No data for this rank</EmptyTitle>
          <EmptyDescription>{MASTER_SUBDIVISION_PAIRING_UNAVAILABLE}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    ) : (
      <SortableDataTable
        data={rows}
        columns={controlMatchupColumns}
        initialSorting={CONTROL_MATCHUP_INITIAL_SORTING}
        getRowId={(row) => row.controlMatchup}
      />
    )}
  </AnalyticsPanel>
)

export { ControlMatchupResults }
