import { useState } from "react"

import type { SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { ChangeExplorerData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CONTROL_MATCHUPS, formatReportingPeriod, getCharacterName } from "@/lib/sf6/model"
import {
  compareBooleans,
  compareCharacterIds,
  compareNumbers,
  compareStrings,
  createTableSortFn,
} from "@/lib/sf6/table-sorting"

type MatchupsData = Extract<ChangeExplorerData, { view: "matchups" }>
type MatchupChangeRow = MatchupsData["matchupChanges"][number]

const MATCHUP_CHANGE_INITIAL_SORTING = [{ id: "change", desc: true }]

const matchupChangeColumns: SortableColumnDef<MatchupChangeRow>[] = [
  {
    id: "controlMatchup",
    accessorFn: (row) =>
      CONTROL_MATCHUPS.find((control) => control.id === row.controlMatchup)?.label ??
      row.controlMatchup,
    header: "Control matchup",
    sortFn: createTableSortFn(compareStrings),
    cell: ({ row }) =>
      CONTROL_MATCHUPS.find((control) => control.id === row.original.controlMatchup)?.label ??
      row.original.controlMatchup,
  },
  {
    id: "character",
    accessorFn: (row) => row.characterId,
    header: "Character",
    sortFn: createTableSortFn(compareCharacterIds),
    cell: ({ row }) => getCharacterName(row.original.characterId),
  },
  {
    id: "opponent",
    accessorFn: (row) => row.opponentId,
    header: "Opponent",
    sortFn: createTableSortFn(compareCharacterIds),
    cell: ({ row }) => getCharacterName(row.original.opponentId),
  },
  {
    id: "before",
    accessorFn: (row) => row.before,
    header: "Before",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.before} format="percent" tone="winRate" />,
  },
  {
    id: "after",
    accessorFn: (row) => row.after,
    header: "After",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.after} format="percent" tone="winRate" />,
  },
  {
    id: "change",
    accessorFn: (row) => Math.abs(row.delta),
    header: "Change",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.delta} format="percentagePoints" tone="directional" signed />
    ),
  },
  {
    id: "flip",
    accessorFn: (row) => row.flip,
    header: "Favored side flip",
    sortFn: createTableSortFn(compareBooleans),
    cell: ({ row }) => (row.original.flip ? "Yes" : "No"),
  },
]

const ChangeMatchupResults = ({ data }: { data: MatchupsData }) => {
  const [onlyFlips, setOnlyFlips] = useState(false)
  const filteredRows = data.matchupChanges.filter((row) => !onlyFlips || row.flip)
  return (
    <AnalyticsPanel
      title="Largest matchup changes"
      description={`${formatReportingPeriod(data.fromPeriod)} → ${formatReportingPeriod(data.toPeriod)} · numeric cells only; a flip crosses 50% between periods.`}
      action={
        <ToggleGroup
          value={[onlyFlips ? "flips" : "all"]}
          onValueChange={(value) => {
            setOnlyFlips(value[0] === "flips")
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Matchup change filter"
        >
          <ToggleGroupItem value="all">All changes</ToggleGroupItem>
          <ToggleGroupItem value="flips">Favored-side flips</ToggleGroupItem>
        </ToggleGroup>
      }
      contentClassName="p-0"
    >
      <SortableDataTable
        data={filteredRows}
        columns={matchupChangeColumns}
        initialSorting={MATCHUP_CHANGE_INITIAL_SORTING}
        getRowId={(row) => `${row.controlMatchup}-${row.characterId}-${row.opponentId}`}
        rowLimit={40}
        className="min-w-max"
      />
    </AnalyticsPanel>
  )
}

export { ChangeMatchupResults }
