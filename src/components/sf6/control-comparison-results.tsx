import type { SortableColumnDef } from "@/components/sf6/sortable-data-table"
import type { CharacterExplorerData, MetaData, RosterOverviewData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { ControlDeltaChart } from "@/components/sf6/charts/control-delta-chart"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableDataTable } from "@/components/sf6/sortable-data-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { compareCharacterIds, compareNumbers, createTableSortFn } from "@/lib/sf6/table-sorting"

type ControlData =
  | Extract<RosterOverviewData, { view: "controls" }>
  | Extract<CharacterExplorerData, { view: "controls" }>
type ControlRow = ControlData["rows"][number]

const CONTROL_INITIAL_SORTING = [{ id: "averageWinRateDelta", desc: true }]

const controlColumns: SortableColumnDef<ControlRow>[] = [
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
    id: "classic",
    accessorFn: (row) => row.classic ?? undefined,
    header: "Classic win rate",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.classic} format="percent" tone="winRate" />,
  },
  {
    id: "modern",
    accessorFn: (row) => row.modern ?? undefined,
    header: "Modern win rate",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.modern} format="percent" tone="winRate" />,
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
      <MetricValue value={row.original.averageWinRateDelta} format="percentagePoints" signed />
    ),
  },
  {
    id: "classicUsage",
    accessorFn: (row) => row.classicUsage ?? undefined,
    header: "Classic usage",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.classicUsage} format="percent" />,
  },
  {
    id: "modernUsage",
    accessorFn: (row) => row.modernUsage ?? undefined,
    header: "Modern usage",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => <MetricValue value={row.original.modernUsage} format="percent" />,
  },
  {
    id: "usageDelta",
    accessorFn: (row) => row.usageDelta ?? undefined,
    header: "Usage share change",
    sortFn: createTableSortFn(compareNumbers),
    sortDescFirst: true,
    sortUndefined: "last",
    meta: { align: "right" },
    cell: ({ row }) => (
      <MetricValue value={row.original.usageDelta} format="percentagePoints" signed />
    ),
  },
]

type ControlComparisonResultsProps = {
  data: ControlData
  meta: MetaData
  chartTitle: string
  chartDescription: string
  tableTitle: string
  tableDescription?: string
  unsupportedDescription: string
}

const ControlComparisonResults = ({
  data,
  meta,
  chartTitle,
  chartDescription,
  tableTitle,
  tableDescription,
  unsupportedDescription,
}: ControlComparisonResultsProps) => {
  if (!data.supported) {
    return (
      <Alert>
        <AlertTitle>Control comparison unavailable</AlertTitle>
        <AlertDescription>{unsupportedDescription}</AlertDescription>
      </Alert>
    )
  }
  const chartRows = data.rows.flatMap((row) =>
    row.averageWinRateDelta === null || row.usageDelta === null
      ? []
      : [
          {
            name:
              meta.characters.find((character) => character.id === row.characterId)?.short ??
              row.characterId,
            averageWinRateDelta: row.averageWinRateDelta,
            usageDelta: row.usageDelta,
          },
        ],
  )
  return (
    <div className="flex flex-col gap-4">
      <AnalyticsPanel title={chartTitle} description={chartDescription}>
        <ControlDeltaChart data={chartRows} />
      </AnalyticsPanel>
      <AnalyticsPanel title={tableTitle} description={tableDescription} contentClassName="p-0">
        <SortableDataTable
          data={data.rows}
          columns={controlColumns}
          initialSorting={CONTROL_INITIAL_SORTING}
          getRowId={(row) => row.characterId}
        />
      </AnalyticsPanel>
    </div>
  )
}

export { ControlComparisonResults }
