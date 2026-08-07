import { useSuspenseQuery } from "@tanstack/react-query"
import { CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts"

import type { DashboardViewProps } from "@/components/sf6/dashboard"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { ChartFrame } from "@/components/sf6/chart-frame"
import { WinRate } from "@/components/sf6/win-rate"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CharacterIdSchema } from "@/lib/sf6/model"
import { balanceQueryOptions } from "@/lib/sf6/query-options"

const AXIS_TICK = { fontSize: 10, fill: "var(--muted-foreground)" }
const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  color: "var(--popover-foreground)",
  fontSize: "12px",
}

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
  <AnalyticsPanel title={label}>
    <p className="truncate font-mono text-xl font-semibold">{value}</p>
  </AnalyticsPanel>
)

const BalanceView = ({ period, search, meta, onChange }: DashboardViewProps) => {
  const { data } = useSuspenseQuery(
    balanceQueryOptions({
      period,
      league: search.league,
      controls: search.controls,
    }),
  )
  const scatterRows = data.rows.map((row) => {
    return {
      ...row,
      x: row.mean,
      y: row.volatility,
      z: Math.max(1, row.spread),
    }
  })
  const handleScatterClick = (payload: unknown): void => {
    if (typeof payload !== "object" || payload === null || !("characterId" in payload)) {
      return
    }
    const characterId = payload.characterId
    const parsed = CharacterIdSchema.safeParse(characterId)
    if (parsed.success) {
      onChange({ character: parsed.data })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Balanced roster" value={`${data.summary.balancedShare}%`} />
        <SummaryCard label="Tier spread" value={`${data.summary.tierSpread.toFixed(1)}%`} />
        <SummaryCard
          label="Character σ"
          value={`${data.summary.meanStandardDeviation.toFixed(1)}%`}
        />
        <SummaryCard
          label="Most volatile"
          value={
            data.summary.mostVolatile
              ? (meta.characters.find(
                  (character) => character.id === data.summary.mostVolatile?.characterId,
                )?.name ?? "—")
              : "—"
          }
        />
      </div>

      <AnalyticsPanel
        title="Balance map"
        description="Average matchup average versus volatility; bubble size is matchup spread"
      >
        <ChartFrame>
          <ScatterChart>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Average"
              domain={[40, 60]}
              tick={AXIS_TICK}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Volatility"
              tick={AXIS_TICK}
              tickFormatter={(value) => `${value}%`}
            />
            <ZAxis type="number" dataKey="z" range={[40, 220]} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Scatter data={scatterRows} fill="var(--chart-2)" onClick={handleScatterClick} />
          </ScatterChart>
        </ChartFrame>
      </AnalyticsPanel>

      <AnalyticsPanel
        title="Balance metrics"
        description={`${data.rows.length} characters · favorable ≥ 53%, unfavorable ≤ 47%`}
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Character</TableHead>
              <TableHead scope="col" className="text-right">
                Average
              </TableHead>
              <TableHead scope="col" className="text-right">
                Min
              </TableHead>
              <TableHead scope="col" className="text-right">
                Max
              </TableHead>
              <TableHead scope="col" className="text-right">
                Spread
              </TableHead>
              <TableHead scope="col" className="text-right">
                σ
              </TableHead>
              <TableHead scope="col" className="text-right">
                Volatility
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow
                key={row.characterId}
                className="cursor-pointer"
                onClick={() => {
                  onChange({ character: row.characterId })
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CharacterBadge characterId={row.characterId} size="small" />
                    <CharacterName characterId={row.characterId} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.mean} />
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.min} />
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.max} />
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.spread} />
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.standardDeviation} />
                </TableCell>
                <TableCell className="text-right">
                  <WinRate value={row.volatility} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </div>
  )
}

export { BalanceView }
