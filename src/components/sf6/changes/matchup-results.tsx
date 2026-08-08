import { useState } from "react"

import type { ChangeExplorerData, MetaData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricValue } from "@/components/sf6/metric-value"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatReportingPeriod, getCharacterName } from "@/lib/sf6/model"

type MatchupsData = Extract<ChangeExplorerData, { view: "matchups" }>

const ChangeMatchupResults = ({ data, meta }: { data: MatchupsData; meta: MetaData }) => {
  const [onlyFlips, setOnlyFlips] = useState(false)
  return (
    <AnalyticsPanel
      title="Largest matchup changes"
      description={`${formatReportingPeriod(data.fromPeriod)} → ${formatReportingPeriod(data.toPeriod)} · numeric cells only; a flip crosses 50% between periods.`}
      action={
        <ToggleGroup
          value={[onlyFlips ? "flips" : "all"]}
          onValueChange={(value) => {
            setOnlyFlips(value[0] === "flips")
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Matchup change filter"
        >
          <ToggleGroupItem value="all">All changes</ToggleGroupItem>
          <ToggleGroupItem value="flips">Favored-side flips</ToggleGroupItem>
        </ToggleGroup>
      }
      contentClassName="p-0"
    >
      <div className="overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead>Control matchup</TableHead>
              <TableHead>Character</TableHead>
              <TableHead>Opponent</TableHead>
              <TableHead className="text-right">Before</TableHead>
              <TableHead className="text-right">After</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead>Favored side flip</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.matchupChanges
              .filter((row) => !onlyFlips || row.flip)
              .slice(0, 40)
              .map((row) => (
                <TableRow key={`${row.controlMatchup}-${row.characterId}-${row.opponentId}`}>
                  <TableCell>
                    {meta.controls.find((control) => control.id === row.controlMatchup)?.label ??
                      row.controlMatchup}
                  </TableCell>
                  <TableCell>{getCharacterName(row.characterId)}</TableCell>
                  <TableCell>{getCharacterName(row.opponentId)}</TableCell>
                  <TableCell className="text-right">
                    <MetricValue value={row.before} format="percent" tone="winRate" />
                  </TableCell>
                  <TableCell className="text-right">
                    <MetricValue value={row.after} format="percent" tone="winRate" />
                  </TableCell>
                  <TableCell className="text-right">
                    <MetricValue
                      value={row.delta}
                      format="percentagePoints"
                      tone="directional"
                      signed
                    />
                  </TableCell>
                  <TableCell>{row.flip ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </AnalyticsPanel>
  )
}

export { ChangeMatchupResults }
