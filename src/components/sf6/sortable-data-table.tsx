import type { CellContext, ColumnDef, RowData, SortingState } from "@tanstack/react-table"
import type { ReactNode } from "react"

import {
  createSortedRowModel,
  metaHelper,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"

import type { ReportingPeriod } from "@/lib/sf6/model"
import type { RankId } from "@/lib/sf6/ranks"

import { SortableTableHead } from "@/components/sf6/sortable-table-head"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type SortableColumnMeta = {
  align?: "left" | "right"
  cellClassName?: string
  opponentId?: string
}

type SortableTableMeta = {
  opponentsLength?: number
  period?: ReportingPeriod
  rank?: RankId
  ranks?: readonly { id: string; label: string }[]
}

const sortableFeatures = tableFeatures({
  columnMeta: metaHelper<SortableColumnMeta>(),
  tableMeta: metaHelper<SortableTableMeta>(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})

type SortableColumnDef<TData extends RowData> = ColumnDef<typeof sortableFeatures, TData>
type SortableCellContext<TData extends RowData> = CellContext<typeof sortableFeatures, TData>

type SortableDataTableProps<TData extends RowData> = {
  columns: readonly SortableColumnDef<TData>[]
  data: readonly TData[]
  emptyFallback?: ReactNode
  getRowId: (row: TData, index: number) => string
  initialSorting?: SortingState
  meta?: SortableTableMeta
  rowLimit?: number
  className?: string
}

const EMPTY_SORTING: SortingState = []

const SortableDataTable = <TData extends RowData>({
  columns,
  data,
  emptyFallback,
  getRowId,
  initialSorting = EMPTY_SORTING,
  meta,
  rowLimit,
  className,
}: SortableDataTableProps<TData>) => {
  const table = useTable({
    features: sortableFeatures,
    columns,
    data,
    enableMultiSort: false,
    enableSortingRemoval: false,
    getRowId,
    initialState: {
      sorting: initialSorting,
    },
    meta,
  })
  const rows =
    rowLimit === undefined ? table.getRowModel().rows : table.getRowModel().rows.slice(0, rowLimit)

  return (
    <Table className={className}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              if (header.isPlaceholder) {
                return null
              }
              const column = header.column
              const direction = column.getIsSorted()
              const label =
                typeof column.columnDef.header === "string" ? column.columnDef.header : column.id
              return (
                <SortableTableHead
                  key={header.id}
                  label={label}
                  active={direction !== false}
                  direction={direction === "desc" ? "desc" : "asc"}
                  onClick={() => {
                    column.toggleSorting()
                  }}
                  align={column.columnDef.meta?.align}
                />
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.length === 0 && emptyFallback !== undefined
          ? emptyFallback
          : rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.columnDef.meta?.align === "right" && "text-right",
                      cell.column.columnDef.meta?.cellClassName,
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
      </TableBody>
    </Table>
  )
}

export {
  SortableDataTable,
  type SortableColumnDef,
  type SortableCellContext,
  type SortableColumnMeta,
  type SortableDataTableProps,
  type SortableTableMeta,
}
