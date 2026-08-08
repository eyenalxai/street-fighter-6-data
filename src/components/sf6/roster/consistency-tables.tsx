import { useMemo } from "react"

import type { SortableCellContext, SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { CharacterId } from "@/lib/sf6/model"
import type { MetaData, RosterOverviewData } from "@/lib/sf6/query-options"

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

type TimeConsistencyData = Extract<RosterOverviewData, { view: "time" }>
type TimeConsistencyRow = TimeConsistencyData["characterConsistency"][number]
type RankConsistencyData = Extract<RosterOverviewData, { view: "ranks" }>
type RankConsistencyRow = RankConsistencyData["characterConsistency"][number]
type ConsistencyRow = {
  characterId: CharacterId
  winRateRange: number | null
}

const renderCharacter = (characterId: TimeConsistencyRow["characterId"]) => (
  <div className="flex items-center gap-2">
    <CharacterBadge characterId={characterId} size="small" />
    <CharacterName characterId={characterId} />
  </div>
)

const characterColumn = <TData extends ConsistencyRow>(): SortableColumnDef<TData> => {
  return {
    id: "character",
    accessorFn: (row) => row.characterId,
    header: "Character",
    sortFn: createTableSortFn(compareCharacterIds),
    cell: ({ row }) => renderCharacter(row.original.characterId),
  }
}

const winRateRangeColumn = <TData extends ConsistencyRow>(): SortableColumnDef<TData> => {
  return {
    id: "winRateRange",
    accessorFn: (row) => row.winRateRange ?? undefined,
    header: "Win rate range",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.winRateRange} format="percentagePoints" />,
  }
}

const timeConsistencyColumns: SortableColumnDef<TimeConsistencyRow>[] = [
  characterColumn<TimeConsistencyRow>(),
  winRateRangeColumn<TimeConsistencyRow>(),
  {
    id: "winRateStandardDeviation",
    accessorFn: (row) => row.winRateStandardDeviation ?? undefined,
    header: "Win rate standard deviation",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.winRateStandardDeviation} format="percentagePoints" />
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
]

const rankCell = (
  rankId: RankConsistencyRow["peakRankId"],
  table: SortableCellContext<RankConsistencyRow>["table"],
) =>
  rankId === null
    ? "—"
    : (table.options.meta?.ranks?.find((rank) => rank.id === rankId)?.label ?? rankId)

const rankConsistencyColumns: SortableColumnDef<RankConsistencyRow>[] = [
  characterColumn<RankConsistencyRow>(),
  winRateRangeColumn<RankConsistencyRow>(),
  {
    id: "peakRank",
    accessorFn: (row) => row.peakRankId ?? undefined,
    header: "Peak rank",
    sortFn: createTableSortFn(compareRankIds),
    sortUndefined: "last",
    cell: ({ row, table }) => rankCell(row.original.peakRankId, table),
  },
  {
    id: "troughRank",
    accessorFn: (row) => row.troughRankId ?? undefined,
    header: "Trough rank",
    sortFn: createTableSortFn(compareRankIds),
    sortUndefined: "last",
    cell: ({ row, table }) => rankCell(row.original.troughRankId, table),
  },
]

const TimeConsistencyTable = ({ data }: { data: TimeConsistencyData["characterConsistency"] }) => (
  <SortableDataTable
    data={data}
    columns={timeConsistencyColumns}
    initialSorting={[{ id: "winRateStandardDeviation", desc: false }]}
    getRowId={(row) => row.characterId}
  />
)

const RankConsistencyTable = ({
  data,
  meta,
}: {
  data: RankConsistencyData["characterConsistency"]
  meta: MetaData
}) => {
  const tableMeta = useMemo(() => {
    return { ranks: meta.ranks }
  }, [meta.ranks])
  return (
    <SortableDataTable
      data={data}
      columns={rankConsistencyColumns}
      initialSorting={[{ id: "winRateRange", desc: false }]}
      getRowId={(row) => row.characterId}
      meta={tableMeta}
    />
  )
}

export { RankConsistencyTable, TimeConsistencyTable }
