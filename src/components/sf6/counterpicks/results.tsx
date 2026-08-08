import type { CounterpickPlannerData, MetaData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { MetricValue } from "@/components/sf6/metric-value"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const CounterpickResults = ({ data, meta }: { data: CounterpickPlannerData; meta: MetaData }) => {
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
      <div className="overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead className="text-right">Weighted average</TableHead>
              <TableHead className="text-right">Unweighted average</TableHead>
              <TableHead className="text-right">Worst matchup</TableHead>
              <TableHead className="text-right">Favorable</TableHead>
              {data.opponents.map((opponentId) => (
                <TableHead key={opponentId} className="text-right">
                  {meta.characters.find((character) => character.id === opponentId)?.short ??
                    opponentId}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.characterId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CharacterBadge characterId={row.characterId} size="small" />
                    <CharacterName characterId={row.characterId} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.weightedAverage} kind="winRate" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.unweightedAverage} kind="winRate" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.floor} kind="winRate" />
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.favorableCount} / {data.opponents.length}
                </TableCell>
                {data.opponents.map((opponentId) => (
                  <TableCell key={opponentId} className="text-right">
                    <MetricValue
                      value={
                        row.matchups.find((matchup) => matchup.opponentId === opponentId)
                          ?.winRate ?? null
                      }
                      kind="winRate"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AnalyticsPanel>
  )
}

export { CounterpickResults }
