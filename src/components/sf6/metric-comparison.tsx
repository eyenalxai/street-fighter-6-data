import type { MetricFormat } from "@/components/sf6/metric-value"

import { MetricValue } from "@/components/sf6/metric-value"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ComparisonRow = {
  label: string
  format: MetricFormat
  before: number | null
  after: number | null
}

const MetricComparison = ({
  fromLabel,
  toLabel,
  rows,
}: {
  fromLabel: string
  toLabel: string
  rows: readonly ComparisonRow[]
}) => (
  <Card size="sm" className="py-0">
    <CardContent className="px-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead />
            <TableHead className="text-right">{fromLabel}</TableHead>
            <TableHead className="text-right">{toLabel}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label} className="hover:bg-transparent">
              <TableCell className="text-muted-foreground">{row.label}</TableCell>
              <TableCell className="text-right font-semibold">
                <MetricValue value={row.before} format={row.format} />
              </TableCell>
              <TableCell className="text-right font-semibold">
                <MetricValue value={row.after} format={row.format} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
)

export { MetricComparison, type ComparisonRow }
