import { useMemo } from "react"

import type { SortableCellContext, SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { MetaData, RosterOverviewData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import { formatReportingPeriod } from "@/lib/sf6/model"
import {
  compareCharacterIds,
  compareNumbers,
  compareRankIds,
  compareReportingPeriods,
  createTableSortFn,
} from "@/lib/sf6/table-sorting"

type StabilityData = Extract<RosterOverviewData, { view: "stability" }>
type StabilityRow = StabilityData["stability"][number]

const ROSTER_STABILITY_INITIAL_SORTING = [{ id: "timeStandardDeviation", desc: false }]

const StabilityPeakRankCell = ({ row, table }: SortableCellContext<StabilityRow>) => {
  const rankId = row.original.peakRankId
  return rankId === null
    ? "—"
    : (table.options.meta?.ranks?.find((rank) => rank.id === rankId)?.label ?? rankId)
}

const StabilityTroughRankCell = ({ row, table }: SortableCellContext<StabilityRow>) => {
  const rankId = row.original.troughRankId
  return rankId === null
    ? "—"
    : (table.options.meta?.ranks?.find((rank) => rank.id === rankId)?.label ?? rankId)
}

const rosterStabilityColumns: SortableColumnDef<StabilityRow>[] = [
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
    id: "timeRange",
    accessorFn: (row) => row.timeRange ?? undefined,
    header: "Time range",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.timeRange} format="percentagePoints" />,
  },
  {
    id: "timeStandardDeviation",
    accessorFn: (row) => row.timeStandardDeviation ?? undefined,
    header: "Time standard deviation",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.timeStandardDeviation} format="percentagePoints" />
    ),
  },
  {
    id: "largestAdjacentChange",
    accessorFn: (row) => row.largestAdjacentChange ?? undefined,
    header: "Largest adjacent change",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.largestAdjacentChange} format="percentagePoints" />
    ),
  },
  {
    id: "rankRange",
    accessorFn: (row) => row.rankRange ?? undefined,
    header: "Rank range",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.rankRange} format="percentagePoints" />,
  },
  {
    id: "peakPeriod",
    accessorFn: (row) => row.peakPeriod ?? undefined,
    header: "Peak period",
    sortFn: createTableSortFn(compareReportingPeriods),
    sortUndefined: "last",
    cell: ({ row }) =>
      row.original.peakPeriod === null ? "—" : formatReportingPeriod(row.original.peakPeriod),
  },
  {
    id: "troughPeriod",
    accessorFn: (row) => row.troughPeriod ?? undefined,
    header: "Trough period",
    sortFn: createTableSortFn(compareReportingPeriods),
    sortUndefined: "last",
    cell: ({ row }) =>
      row.original.troughPeriod === null ? "—" : formatReportingPeriod(row.original.troughPeriod),
  },
  {
    id: "peakRank",
    accessorFn: (row) => row.peakRankId ?? undefined,
    header: "Peak rank",
    sortFn: createTableSortFn(compareRankIds),
    sortUndefined: "last",
    cell: StabilityPeakRankCell,
  },
  {
    id: "troughRank",
    accessorFn: (row) => row.troughRankId ?? undefined,
    header: "Trough rank",
    sortFn: createTableSortFn(compareRankIds),
    sortUndefined: "last",
    cell: StabilityTroughRankCell,
  },
]

const RosterStabilityResults = ({ data, meta }: { data: StabilityData; meta: MetaData }) => {
  const tableMeta = useMemo(() => {
    return { ranks: meta.ranks }
  }, [meta.ranks])
  return (
    <AnalyticsPanel
      title="Character consistency"
      description="Lower time standard deviation and rank range indicate more stable win rate. These are separate measures, not a combined score."
      contentClassName="p-0"
    >
      <SortableDataTable
        data={data.stability}
        columns={rosterStabilityColumns}
        initialSorting={ROSTER_STABILITY_INITIAL_SORTING}
        getRowId={(row) => row.characterId}
        meta={tableMeta}
      />
    </AnalyticsPanel>
  )
}

export { RosterStabilityResults }
