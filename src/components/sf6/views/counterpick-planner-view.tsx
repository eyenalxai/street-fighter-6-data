import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"

import type { CharacterId, LeagueId, ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { CounterpickSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { CharacterMultiField } from "@/components/sf6/filters/character-multi-field"
import { ControlMatchupField } from "@/components/sf6/filters/control-matchup-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { ResultsStatus } from "@/components/sf6/results-status"
import { WinRate } from "@/components/sf6/win-rate"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toMatchupSearch } from "@/lib/sf6/navigation"
import { counterpicksQueryOptions } from "@/lib/sf6/query-options"

type CounterpickPlannerViewProps = {
  period: ReportingPeriod
  search: CounterpickSearch
  meta: MetaData
}

const CounterpickEmptyState = () => (
  <>
    <ResultsStatus message="No opponents selected." />
    <AnalyticsPanel
      title="Select opponents"
      description="Choose one or more opponents to calculate counterpick candidates."
    >
      <Empty className="min-h-48">
        <EmptyHeader>
          <EmptyTitle>No opponents selected</EmptyTitle>
          <EmptyDescription>
            Use the Opponents field above to choose who the candidates should be measured against.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </AnalyticsPanel>
  </>
)

const CounterpickDataResults = ({ period, search, meta }: CounterpickPlannerViewProps) => {
  const { data } = useSuspenseQuery(
    counterpicksQueryOptions({
      period,
      league: search.league,
      controls: search.controls,
      opponents: search.opponents,
    }),
  )
  const opponent = search.opponents[0] ?? "ryu"

  return (
    <>
      <ResultsStatus />
      <AnalyticsPanel
        title="Best candidates against selected opponents"
        description={`${data.rows.length} candidates · average win rate against ${data.opponents.length} selected opponents · highest average first`}
        contentClassName="p-0"
      >
        <div className="overflow-x-auto">
          <Table className="min-w-max">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Candidate</TableHead>
                <TableHead scope="col" className="text-right">
                  Average vs selected opponents
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Lowest vs selected opponents
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Opponents at or above 50%
                </TableHead>
                {data.opponents.map((opponentId) => (
                  <TableHead key={opponentId} scope="col" className="text-right">
                    {meta.characters.find((character) => character.id === opponentId)?.name ??
                      opponentId}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row) => (
                <TableRow key={row.characterId}>
                  <TableCell>
                    <Link
                      to="/matchups"
                      search={toMatchupSearch({
                        period,
                        league: search.league,
                        character: row.characterId,
                        opponent,
                        controls: search.controls,
                      })}
                      className="inline-flex items-center gap-2 font-medium hover:underline"
                    >
                      <CharacterBadge characterId={row.characterId} size="small" />
                      <CharacterName characterId={row.characterId} />
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <WinRate value={row.averageWinRate} />
                  </TableCell>
                  <TableCell className="text-right">
                    <WinRate value={row.worstWinRate} />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {row.atOrAbove50Count} / {data.opponents.length}
                  </TableCell>
                  {data.opponents.map((opponentId) => (
                    <TableCell key={opponentId} className="text-right">
                      <WinRate
                        value={
                          row.matchups.find((matchup) => matchup.opponentId === opponentId)
                            ?.winRate ?? null
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalyticsPanel>
    </>
  )
}

const CounterpickResults = (props: CounterpickPlannerViewProps) =>
  props.search.opponents.length === 0 ? (
    <CounterpickEmptyState />
  ) : (
    <CounterpickDataResults {...props} />
  )

const CounterpickPlannerView = ({ period, search, meta }: CounterpickPlannerViewProps) => {
  const navigate = useNavigate({ from: "/matchups/counterpicks" })
  const change = (
    changes: Partial<{
      period: ReportingPeriod
      league: LeagueId
      controls: CounterpickSearch["controls"]
      opponents: CharacterId[]
    }>,
  ) => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
      replace: true,
    })
  }
  const toolbar = (
    <AnalysisToolbar
      title="Counterpick planner"
      description="Which characters have the best average win rate against the opponents you select?"
    >
      <ReportingPeriodField
        value={period}
        periods={meta.periods}
        onChange={(value) => {
          change({ period: value })
        }}
      />
      <RankField
        value={search.league}
        leagues={meta.leagues}
        onChange={(value) => {
          change({ league: value })
        }}
      />
      <ControlMatchupField
        value={search.controls}
        controls={meta.controls}
        onChange={(value) => {
          change({ controls: value })
        }}
      />
      <CharacterMultiField
        label="Opponents"
        value={search.opponents}
        characters={meta.characters}
        className="sm:col-span-2"
        onChange={(value) => {
          change({ opponents: value })
        }}
        onClear={() => {
          change({ opponents: [] })
        }}
        placeholder="Search opponents"
        description="Each candidate is scored against every selected opponent."
      />
    </AnalysisToolbar>
  )

  return (
    <AnalysisPage
      toolbar={toolbar}
      resetKey={`${period}|${search.league}|${search.controls}|${search.opponents.join(",")}`}
      skeleton="table"
    >
      <CounterpickResults period={period} search={search} meta={meta} />
    </AnalysisPage>
  )
}

export { CounterpickPlannerView }
