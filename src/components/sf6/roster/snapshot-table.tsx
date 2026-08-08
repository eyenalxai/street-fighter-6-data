import { Link } from "@tanstack/react-router"
import { useMemo } from "react"

import type { SortableCellContext, SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { CharacterId, ReportingPeriod } from "@/lib/sf6/model"
import type { RosterOverviewData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"

import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import { METRIC_LABELS } from "@/lib/sf6/presentation"
import {
  compareCharacterIds,
  compareNumbers,
  createTableSortFn,
  ratio,
} from "@/lib/sf6/table-sorting"

type SnapshotData = Extract<RosterOverviewData, { view: "snapshot" }>
type SnapshotRow = SnapshotData["rows"][number]

const SNAPSHOT_INITIAL_SORTING = [{ id: "averageWinRate", desc: true }]

const CharacterMatchupLink = ({
  period,
  rank,
  characterId,
}: {
  period: ReportingPeriod
  rank: RankId
  characterId: SnapshotRow["characterId"]
}) => {
  const opponent: CharacterId = characterId === "ryu" ? "ken" : "ryu"
  const search = useMemo(() => {
    return {
      period,
      rank,
      character: characterId,
      opponent,
      controls: "combined" as const,
      view: "head-to-head" as const,
    }
  }, [characterId, opponent, period, rank])
  return (
    <Link
      to="/matchups"
      search={search}
      className="inline-flex items-center gap-2 font-medium hover:underline"
    >
      <CharacterBadge characterId={characterId} size="small" />
      <CharacterName characterId={characterId} />
    </Link>
  )
}

const SnapshotCharacterCell = ({ row, table }: SortableCellContext<SnapshotRow>) => {
  const period = table.options.meta?.period
  const rank = table.options.meta?.rank
  return period === undefined || rank === undefined ? (
    <div className="flex items-center gap-2">
      <CharacterBadge characterId={row.original.characterId} size="small" />
      <CharacterName characterId={row.original.characterId} />
    </div>
  ) : (
    <CharacterMatchupLink period={period} rank={rank} characterId={row.original.characterId} />
  )
}

const snapshotColumns: SortableColumnDef<SnapshotRow>[] = [
  {
    id: "character",
    accessorFn: (row) => row.characterId,
    header: "Character",
    sortFn: createTableSortFn(compareCharacterIds),
    cell: SnapshotCharacterCell,
  },
  {
    id: "averageWinRate",
    accessorFn: (row) => row.averageWinRate ?? undefined,
    header: "Average win rate",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.averageWinRate} format="percent" tone="winRate" />
    ),
  },
  {
    id: "weightedAverageWinRate",
    accessorFn: (row) => row.weightedAverageWinRate ?? undefined,
    header: "Weighted average win rate",
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
    header: METRIC_LABELS.usageWeightCoverage,
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.weightCoverage} format="coverage" />,
  },
  {
    id: "usage",
    accessorFn: (row) => row.usage ?? undefined,
    header: "Usage share",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.usage} format="percent" />,
  },
  {
    id: "averageWinRateDelta",
    accessorFn: (row) => row.averageWinRateDelta ?? undefined,
    header: "Win rate change",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
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
    id: "floor",
    accessorFn: (row) => row.floor ?? undefined,
    header: "Worst matchup",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.floor} format="percent" tone="winRate" />,
  },
  {
    id: "favorable",
    accessorFn: (row) => ratio(row.favorableCount, row.possibleCount),
    header: METRIC_LABELS.favorableAtOrAbove50,
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right", cellClassName: "font-mono" },
    cell: ({ row }) => `${row.original.favorableCount} / ${row.original.possibleCount}`,
  },
]

const SnapshotTable = ({
  rows,
  period,
  rank,
}: {
  rows: readonly SnapshotRow[]
  period: ReportingPeriod
  rank: RankId
}) => {
  const tableMeta = useMemo(() => {
    return { period, rank }
  }, [period, rank])
  return (
    <SortableDataTable
      data={rows}
      columns={snapshotColumns}
      initialSorting={SNAPSHOT_INITIAL_SORTING}
      getRowId={(row) => row.characterId}
      meta={tableMeta}
    />
  )
}

export { SnapshotTable }
