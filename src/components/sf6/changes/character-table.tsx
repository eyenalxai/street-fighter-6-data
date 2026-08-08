import type { SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { ChangeExplorerData } from "@/lib/sf6/query-options"

import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import {
  compareBooleans,
  compareCharacterIds,
  compareNumbers,
  createTableSortFn,
} from "@/lib/sf6/table-sorting"

type ChangeRow = Extract<ChangeExplorerData, { view: "overview" }>["rows"][number]
const changeColumns: SortableColumnDef<ChangeRow>[] = [
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
    id: "averageWinRateDelta",
    accessorFn: (row) => row.averageWinRateDelta,
    header: "Win rate change",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue
        value={row.original.averageWinRateDelta}
        format="percentagePoints"
        tone="directional"
        signed
      />
    ),
  },
  {
    id: "beforeAverageWinRate",
    accessorFn: (row) => row.beforeAverageWinRate ?? undefined,
    header: "Before win rate",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.beforeAverageWinRate} format="percent" tone="winRate" />
    ),
  },
  {
    id: "averageWinRate",
    accessorFn: (row) => row.averageWinRate ?? undefined,
    header: "After win rate",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.averageWinRate} format="percent" tone="winRate" />
    ),
  },
  {
    id: "weightedAverageWinRateDelta",
    accessorFn: (row) => row.weightedAverageWinRateDelta ?? undefined,
    header: "Weighted win rate change",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue
        value={row.original.weightedAverageWinRateDelta}
        format="percentagePoints"
        tone="directional"
        signed
      />
    ),
  },
  {
    id: "beforeWeightedAverageWinRate",
    accessorFn: (row) => row.beforeWeightedAverageWinRate ?? undefined,
    header: "Before weighted",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue
        value={row.original.beforeWeightedAverageWinRate}
        format="percent"
        tone="winRate"
      />
    ),
  },
  {
    id: "weightedAverageWinRate",
    accessorFn: (row) => row.weightedAverageWinRate ?? undefined,
    header: "After weighted",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.weightedAverageWinRate} format="percent" tone="winRate" />
    ),
  },
  {
    id: "weightCoverage",
    accessorFn: (row) => row.weightCoverage ?? undefined,
    header: "Weight coverage",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.weightCoverage} format="coverage" />,
  },
  {
    id: "usageDelta",
    accessorFn: (row) => row.usageDelta ?? undefined,
    header: "Usage change",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.usageDelta} format="percentagePoints" signed />
    ),
  },
  {
    id: "beforeUsage",
    accessorFn: (row) => row.beforeUsage ?? undefined,
    header: "Before usage",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.beforeUsage} format="percent" />,
  },
  {
    id: "usage",
    accessorFn: (row) => row.usage ?? undefined,
    header: "After usage",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.usage} format="percent" />,
  },
  {
    id: "debut",
    accessorFn: (row) => row.debut,
    header: "Debut in later period",
    sortFn: createTableSortFn(compareBooleans),
    cell: ({ row }) => (row.original.debut ? "Yes" : "—"),
  },
]

const ChangeCharacterTable = ({ rows }: { rows: readonly ChangeRow[] }) => (
  <SortableDataTable
    data={rows}
    columns={changeColumns}
    initialSorting={[{ id: "averageWinRateDelta", desc: true }]}
    getRowId={(row) => row.characterId}
    className="min-w-max"
  />
)

export { ChangeCharacterTable }
