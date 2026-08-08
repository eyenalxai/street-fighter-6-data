import { useNavigate } from "@tanstack/react-router"
import { ArrowLeftRight } from "lucide-react"

import type { ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { MatchupSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { AnalysisViewTabs } from "@/components/sf6/analysis-view-tabs"
import { CounterpickResults } from "@/components/sf6/counterpicks/results"
import { CharacterField } from "@/components/sf6/filters/character-field"
import { CharacterMultiField } from "@/components/sf6/filters/character-multi-field"
import { ControlMatchupField } from "@/components/sf6/filters/control-matchup-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { HeadToHeadResults } from "@/components/sf6/matchups/head-to-head-results"
import { MatchupProfileResults } from "@/components/sf6/matchups/profile-results"
import { MatchupRankResults } from "@/components/sf6/matchups/rank-results"
import { MatchupTimeResults } from "@/components/sf6/matchups/time-results"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import { getMatchupPeriodOptions } from "@/lib/sf6/analysis-dependencies"
import {
  buildCounterpickInput,
  buildMatchupInput,
  getActiveInputKey,
} from "@/lib/sf6/analysis-scope"
import {
  counterpickPlannerQueryOptions,
  matchupExplorerQueryOptions,
} from "@/lib/sf6/query-options"
import { getEffectiveControls } from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"

const viewOptions = [
  { value: "head-to-head", label: "Head to head" },
  { value: "profile", label: "Profile" },
  { value: "ranks", label: "Across ranks" },
  { value: "time", label: "Over time" },
  { value: "counterpicks", label: "Counterpick planner" },
] as const

type MatchupExplorerViewProps = {
  period?: ReportingPeriod
  search: MatchupSearch
  meta: MetaData
}

const requirePeriod = (period: ReportingPeriod | undefined): ReportingPeriod => {
  if (period === undefined) {
    throw new Error("A reporting period is required for this matchup view")
  }
  return period
}

const MatchupQueryView = ({ period, search, meta }: MatchupExplorerViewProps) => {
  const input = buildMatchupInput(search, period)
  const { data, displayedInput, isUpdating } = useAnalyticsQuery(
    matchupExplorerQueryOptions(input),
    input,
  )
  return data === undefined ? (
    <ResultsPending />
  ) : (
    <ResultsContent isUpdating={isUpdating}>
      {displayedInput.view === "head-to-head" && data.view === "head-to-head" ? (
        <HeadToHeadResults
          data={data}
          meta={meta}
          period={displayedInput.period}
          controls={displayedInput.controls}
          character={displayedInput.character}
          opponent={displayedInput.opponent}
        />
      ) : displayedInput.view === "profile" && data.view === "profile" ? (
        <MatchupProfileResults
          data={data}
          meta={meta}
          period={displayedInput.period}
          controls={displayedInput.controls}
          character={displayedInput.character}
        />
      ) : displayedInput.view === "ranks" && data.view === "ranks" ? (
        <MatchupRankResults data={data} />
      ) : displayedInput.view === "time" && data.view === "time" ? (
        <MatchupTimeResults data={data} />
      ) : null}
    </ResultsContent>
  )
}

const CounterpickQueryView = ({
  period,
  search,
  meta,
  onOrderChange,
}: MatchupExplorerViewProps & {
  period: ReportingPeriod
  onOrderChange: (order: MatchupSearch["order"]) => void
}) => {
  const input = buildCounterpickInput(search, period)
  const { data, isUpdating } = useAnalyticsQuery(counterpickPlannerQueryOptions(input), input)
  return data === undefined ? (
    <ResultsPending />
  ) : (
    <ResultsContent isUpdating={isUpdating}>
      <CounterpickResults
        data={data}
        meta={meta}
        order={input.order}
        onOrderChange={onOrderChange}
      />
    </ResultsContent>
  )
}

const CounterpickView = ({
  period,
  search,
  meta,
  onOrderChange,
}: MatchupExplorerViewProps & {
  onOrderChange: (order: MatchupSearch["order"]) => void
}) =>
  search.opponents.length === 0 ? (
    <Empty className="min-h-48 border border-dashed">
      <EmptyHeader>
        <EmptyTitle>Select opponents</EmptyTitle>
        <EmptyDescription>
          Choose one or more opponents to calculate counterpick candidates.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ) : (
    <CounterpickQueryView
      period={requirePeriod(period)}
      search={search}
      meta={meta}
      onOrderChange={onOrderChange}
    />
  )

const MatchupExplorerView = ({ period, search, meta }: MatchupExplorerViewProps) => {
  const navigate = useNavigate({ from: "/matchups" })
  const change = (changes: Partial<MatchupSearch>) => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
      replace: true,
    })
  }
  const controls = getEffectiveControls(search.rank, search.controls)
  const periods = getMatchupPeriodOptions(
    search.view,
    search.rank,
    meta.periods,
    meta.subdivisionPeriods,
  )
  const activeInput =
    search.view === "counterpicks"
      ? buildCounterpickInput(search, period)
      : buildMatchupInput(search, period)
  const showPeriod = search.view !== "time"
  const showRank = search.view !== "ranks"
  const showControls = search.view !== "ranks" && !isMasterSubdivisionRank(search.rank)
  const showOpponent = search.view !== "profile" && search.view !== "counterpicks"
  const showCharacter = search.view !== "counterpicks"
  const showSwap =
    search.view === "head-to-head" || search.view === "ranks" || search.view === "time"
  const toolbar = (
    <AnalysisToolbar
      title="Matchup explorer"
      description="Compare a matchup, inspect a character profile, or plan counterpicks."
      views={
        <AnalysisViewTabs
          value={search.view}
          options={viewOptions}
          aria-label="Matchup views"
          onChange={(view) => {
            change({ view })
          }}
        />
      }
    >
      {showPeriod && period !== undefined ? (
        <ReportingPeriodField
          value={period}
          periods={periods}
          onChange={(value) => {
            change({ period: value })
          }}
        />
      ) : null}
      {showRank ? (
        <RankField
          value={search.rank}
          ranks={meta.ranks}
          onChange={(value) => {
            change({ rank: value })
          }}
        />
      ) : null}
      {showControls ? (
        <ControlMatchupField
          value={controls}
          controls={meta.controls}
          onChange={(value) => {
            change({ controls: value })
          }}
        />
      ) : null}
      {showCharacter ? (
        <CharacterField
          label="Character"
          value={search.character}
          characters={meta.characters}
          onChange={(value) => {
            change({ character: value })
          }}
        />
      ) : (
        <CharacterMultiField
          label="Opponents"
          value={search.opponents}
          characters={meta.characters}
          className="sm:col-span-2 xl:col-span-2"
          onChange={(value) => {
            change({ opponents: value })
          }}
          onClear={() => {
            change({ opponents: [] })
          }}
          description="Candidates must have a numeric result against every selected opponent."
        />
      )}
      {showOpponent ? (
        <CharacterField
          label="Opponent"
          value={search.opponent}
          characters={meta.characters}
          onChange={(value) => {
            change({ opponent: value })
          }}
        />
      ) : null}
      {showSwap ? (
        <Button
          type="button"
          variant="outline"
          className="self-end"
          onClick={() => {
            change({ character: search.opponent, opponent: search.character })
          }}
        >
          <ArrowLeftRight data-icon="inline-start" />
          Swap sides
        </Button>
      ) : null}
    </AnalysisToolbar>
  )
  return (
    <AnalysisPage toolbar={toolbar} resetKey={getActiveInputKey(activeInput)}>
      {search.view === "counterpicks" ? (
        <CounterpickView
          period={period}
          search={search}
          meta={meta}
          onOrderChange={(order) => {
            change({ order })
          }}
        />
      ) : (
        <MatchupQueryView period={period} search={search} meta={meta} />
      )}
    </AnalysisPage>
  )
}

export { MatchupExplorerView }
