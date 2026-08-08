import type { SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { MatchupExplorerData } from "@/lib/sf6/query-options"

import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import {
  compareCharacterIds,
  compareEnum,
  compareNumbers,
  createTableSortFn,
} from "@/lib/sf6/table-sorting"

type ProfileData = Extract<MatchupExplorerData, { view: "profile" }>
type ProfileRow = ProfileData["profile"][number]
type SimilarProfileRow = ProfileData["similarProfiles"][number]

const PROFILE_INITIAL_SORTING = [{ id: "winRate", desc: false }]
const SIMILAR_PROFILE_INITIAL_SORTING = [{ id: "correlation", desc: true }]
const compareProfileStatuses = compareEnum(["numeric", "mirror", "unavailable"] as const)

const profileColumns: SortableColumnDef<ProfileRow>[] = [
  {
    id: "opponent",
    accessorFn: (row) => row.opponentId,
    header: "Opponent",
    sortFn: createTableSortFn(compareCharacterIds),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CharacterBadge characterId={row.original.opponentId} size="small" />
        <CharacterName characterId={row.original.opponentId} />
      </div>
    ),
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
  {
    id: "opponentUsage",
    accessorFn: (row) => row.opponentUsage ?? undefined,
    header: "Opponent usage",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.opponentUsage} format="percent" />,
  },
  {
    id: "weightedDisadvantageContribution",
    accessorFn: (row) => row.weightedDisadvantageContribution ?? undefined,
    header: "Weighted disadvantage contribution",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue
        value={row.original.weightedDisadvantageContribution}
        format="percentagePoints"
      />
    ),
  },
  {
    id: "status",
    accessorFn: (row) => row.status,
    header: "Status",
    sortFn: createTableSortFn(compareProfileStatuses),
    meta: { cellClassName: "text-muted-foreground" },
    cell: ({ row }) => row.original.status,
  },
]

const similarProfileColumns: SortableColumnDef<SimilarProfileRow>[] = [
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
    id: "correlation",
    accessorFn: (row) => row.correlation,
    header: "Correlation",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    meta: { align: "right", cellClassName: "font-mono" },
    cell: ({ row }) => row.original.correlation.toFixed(2),
  },
  {
    id: "overlap",
    accessorFn: (row) => row.overlap,
    header: "Shared opponents",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    meta: { align: "right", cellClassName: "font-mono" },
    cell: ({ row }) => row.original.overlap,
  },
]

const MatchupProfileTable = ({ rows }: { rows: readonly ProfileRow[] }) => (
  <SortableDataTable
    data={rows}
    columns={profileColumns}
    initialSorting={PROFILE_INITIAL_SORTING}
    getRowId={(row) => row.opponentId}
  />
)

const SimilarProfilesTable = ({ rows }: { rows: readonly SimilarProfileRow[] }) => (
  <SortableDataTable
    data={rows}
    columns={similarProfileColumns}
    initialSorting={SIMILAR_PROFILE_INITIAL_SORTING}
    getRowId={(row) => row.characterId}
  />
)

export { MatchupProfileTable, SimilarProfilesTable }
