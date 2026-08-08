import { useMemo } from "react"

import type { SortableCellContext, SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { CounterpickPlannerData, MetaData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  compareCharacterIds,
  compareNumbers,
  createTableSortFn,
  ratio,
} from "@/lib/sf6/table-sorting"

type CounterpickRow = CounterpickPlannerData["rows"][number]

const COUNTERPICK_INITIAL_SORTING = [{ id: "weightedAverage", desc: true }]

const CounterpickCandidateCell = ({ row }: SortableCellContext<CounterpickRow>) => (
  <div className="flex items-center gap-2">
    <CharacterBadge characterId={row.original.characterId} size="small" />
    <CharacterName characterId={row.original.characterId} />
  </div>
)

const CounterpickWeightedAverageCell = ({ row }: SortableCellContext<CounterpickRow>) => (
  <MetricValue value={row.original.weightedAverage} format="percent" tone="winRate" />
)

const CounterpickAverageCell = ({ row }: SortableCellContext<CounterpickRow>) => (
  <MetricValue value={row.original.unweightedAverage} format="percent" tone="winRate" />
)

const CounterpickFloorCell = ({ row }: SortableCellContext<CounterpickRow>) => (
  <MetricValue value={row.original.floor} format="percent" tone="winRate" />
)

const CounterpickFavorableCell = ({ row, table }: SortableCellContext<CounterpickRow>) => (
  <>
    {row.original.favorableCount} / {table.options.meta?.opponentsLength ?? "—"}
  </>
)

const CounterpickOpponentCell = ({ row, column }: SortableCellContext<CounterpickRow>) => {
  const opponentId = column.columnDef.meta?.opponentId
  const winRate =
    opponentId === undefined
      ? null
      : (row.original.matchups.find((matchup) => matchup.opponentId === opponentId)?.winRate ??
        null)
  return <MetricValue value={winRate} format="percent" tone="winRate" />
}

const CounterpickResults = ({ data, meta }: { data: CounterpickPlannerData; meta: MetaData }) => {
  const columns = useMemo<SortableColumnDef<CounterpickRow>[]>(
    () => [
      {
        id: "candidate",
        accessorFn: (row) => row.characterId,
        header: "Candidate",
        sortFn: createTableSortFn(compareCharacterIds),
        cell: CounterpickCandidateCell,
      },
      {
        id: "weightedAverage",
        accessorFn: (row) => row.weightedAverage ?? undefined,
        header: "Weighted average",
        sortFn: createTableSortFn(compareNumbers),
        sortDescFirst: true,
        sortUndefined: "last",
        meta: { align: "right" },
        cell: CounterpickWeightedAverageCell,
      },
      {
        id: "unweightedAverage",
        accessorFn: (row) => row.unweightedAverage,
        header: "Unweighted average",
        sortFn: createTableSortFn(compareNumbers),
        sortDescFirst: true,
        meta: { align: "right" },
        cell: CounterpickAverageCell,
      },
      {
        id: "floor",
        accessorFn: (row) => row.floor,
        header: "Worst matchup",
        sortFn: createTableSortFn(compareNumbers),
        sortDescFirst: true,
        meta: { align: "right" },
        cell: CounterpickFloorCell,
      },
      {
        id: "favorable",
        accessorFn: (row) => ratio(row.favorableCount, data.opponents.length),
        header: "Favorable",
        sortFn: createTableSortFn(compareNumbers),
        sortDescFirst: true,
        meta: { align: "right", cellClassName: "font-mono" },
        cell: CounterpickFavorableCell,
      },
      ...data.opponents.map((opponentId) => {
        return {
          id: `opponent:${opponentId}`,
          accessorFn: (row: CounterpickRow) =>
            row.matchups.find((matchup) => matchup.opponentId === opponentId)?.winRate ?? undefined,
          header:
            meta.characters.find((character) => character.id === opponentId)?.short ?? opponentId,
          sortFn: createTableSortFn(compareNumbers),
          sortDescFirst: true,
          sortUndefined: "last" as const,
          meta: { align: "right" as const, opponentId },
          cell: CounterpickOpponentCell,
        }
      }),
    ],
    [data.opponents, meta.characters],
  )
  const tableMeta = useMemo(() => {
    return { opponentsLength: data.opponents.length }
  }, [data.opponents.length])

  if (data.rows.length === 0) {
    return (
      <Empty className="min-h-48 border border-dashed">
        <EmptyHeader>
          <EmptyTitle>No complete candidates</EmptyTitle>
          <EmptyDescription>
            {data.excludedCandidateCount} candidates lacked at least one reported matchup against
            the selected opponents.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }
  return (
    <AnalyticsPanel
      title="Counterpick candidates"
      description={`Selected opponents represent ${data.selectedUsageShare === null ? "an unknown share" : `${data.selectedUsageShare.toFixed(1)}%`} of the opponent usage population (${data.weightCoverage === null ? "unknown" : `${(data.weightCoverage * 100).toFixed(0)}%`} of available popularity weight). Weighted averages renormalize only over selected opponents; they are not match-volume measurements.`}
      contentClassName="p-0"
    >
      <SortableDataTable
        key={data.opponents.join(",")}
        data={data.rows}
        columns={columns}
        initialSorting={COUNTERPICK_INITIAL_SORTING}
        getRowId={(row) => row.characterId}
        className="min-w-max"
        meta={tableMeta}
      />
    </AnalyticsPanel>
  )
}

export { CounterpickResults }
