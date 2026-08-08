import { useNavigate } from "@tanstack/react-router"
import { ArrowLeftRight } from "lucide-react"

import type { ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { MatchupSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisSelectionEmpty } from "@/components/sf6/analysis-selection-empty"
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
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import { getMatchupPeriodOptions, hasSelectedCharacters } from "@/lib/sf6/analysis-dependencies"
import {
  buildCounterpickInput,
  buildMatchupInput,
  getActiveInputKey,
} from "@/lib/sf6/analysis-scope"
import { VIEW_LABELS } from "@/lib/sf6/presentation"
import {
  counterpickPlannerQueryOptions,
  matchupExplorerQueryOptions,
} from "@/lib/sf6/query-options"
import { getEffectiveControls } from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"

const viewOptions = [
  { value: "head-to-head", label: VIEW_LABELS.headToHead },
  { value: "profile", label: VIEW_LABELS.profile },
  { value: "ranks", label: VIEW_LABELS.ranks },
  { value: "time", label: VIEW_LABELS.time },
  { value: "counterpicks", label: VIEW_LABELS.counterpicks },
] as const

type MatchupExplorerViewProps = {
  period?: ReportingPeriod
  search: MatchupSearch
  meta: MetaData
}

const requirePeriod = (period: ReportingPeriod | undefined): ReportingPeriod => {
  if (period === undefined) {
    throw new Error("This view needs a reporting period.")
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
}: MatchupExplorerViewProps & {
  period: ReportingPeriod
}) => {
  const input = buildCounterpickInput(search, period)
  const { data, isUpdating } = useAnalyticsQuery(counterpickPlannerQueryOptions(input), input)
  return data === undefined ? (
    <ResultsPending />
  ) : (
    <ResultsContent isUpdating={isUpdating}>
      <CounterpickResults data={data} meta={meta} />
    </ResultsContent>
  )
}

const CounterpickView = ({ period, search, meta }: MatchupExplorerViewProps) =>
  hasSelectedCharacters(search.opponents) ? (
    <CounterpickQueryView period={requirePeriod(period)} search={search} meta={meta} />
  ) : (
    <AnalysisSelectionEmpty
      title="Select opponents"
      description="Select one or more opponents to find counterpick candidates."
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
      description="Compare matchups, inspect character profiles, and plan counterpicks."
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
          description="Each candidate needs a reported result against every selected opponent."
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
        <CounterpickView period={period} search={search} meta={meta} />
      ) : (
        <MatchupQueryView period={period} search={search} meta={meta} />
      )}
    </AnalysisPage>
  )
}

export { MatchupExplorerView }
