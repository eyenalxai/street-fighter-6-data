import { useNavigate } from "@tanstack/react-router"

import type { CharacterInput } from "@/lib/sf6/analysis-scope"
import type { ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { CharacterExplorerSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisSelectionEmpty } from "@/components/sf6/analysis-selection-empty"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { AnalysisViewTabs } from "@/components/sf6/analysis-view-tabs"
import { CharacterRankResults } from "@/components/sf6/characters/rank-results"
import { CharacterTimeResults } from "@/components/sf6/characters/time-results"
import { ControlComparisonResults } from "@/components/sf6/control-comparison-results"
import { CharacterMultiField } from "@/components/sf6/filters/character-multi-field"
import { PlayerControlField } from "@/components/sf6/filters/player-control-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import {
  getCharacterPeriodOptions,
  getControlComparisonRanks,
  hasSelectedCharacters,
} from "@/lib/sf6/analysis-dependencies"
import { buildCharacterInput, getActiveInputKey } from "@/lib/sf6/analysis-scope"
import { characterExplorerQueryOptions } from "@/lib/sf6/query-options"
import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"

const viewOptions = [
  { value: "time", label: "Over time" },
  { value: "ranks", label: "Across ranks" },
  { value: "controls", label: "Control styles" },
] as const

type CharacterExplorerViewProps = {
  period?: ReportingPeriod
  search: CharacterExplorerSearch
  meta: MetaData
}

const CharacterQueryView = ({ input, meta }: { input: CharacterInput; meta: MetaData }) => {
  const { data, displayedInput, isUpdating } = useAnalyticsQuery(
    characterExplorerQueryOptions(input),
    input,
  )
  return data === undefined ? (
    <ResultsPending />
  ) : (
    <ResultsContent isUpdating={isUpdating}>
      {displayedInput.view === "time" && data.view === "time" ? (
        <CharacterTimeResults data={data} meta={meta} />
      ) : displayedInput.view === "ranks" && data.view === "ranks" ? (
        <CharacterRankResults data={data} meta={meta} />
      ) : displayedInput.view === "controls" && data.view === "controls" ? (
        <ControlComparisonResults
          data={data}
          meta={meta}
          chartTitle="Control win rate difference"
          chartDescription="Positive values favor Modern player controls for the selected character."
          tableTitle="Selected character control results"
          unsupportedDescription="Master subdivision snapshots contain combined control data only. Choose All Master or a standard rank to compare Classic and Modern players."
        />
      ) : null}
    </ResultsContent>
  )
}

const CharacterExplorerView = ({ period, search, meta }: CharacterExplorerViewProps) => {
  const navigate = useNavigate({ from: "/characters" })
  const change = (changes: Partial<CharacterExplorerSearch>) => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
      replace: true,
    })
  }
  const controlRank =
    getControlComparisonRanks(meta.ranks).find((rank) => rank.id === search.rank)?.id ??
    "all-master"
  const rankValue = search.view === "controls" ? controlRank : search.rank
  const input = buildCharacterInput(search, period)
  const periods = getCharacterPeriodOptions(
    search.view,
    rankValue,
    meta.periods,
    meta.subdivisionPeriods,
  )
  const showPeriod = search.view !== "time"
  const showRank = search.view !== "ranks"
  const showPlayerControl = search.view === "time" && !isMasterSubdivisionRank(search.rank)
  const toolbar = (
    <AnalysisToolbar
      title="Character explorer"
      description="Follow selected characters through time, ranks, and control styles."
      views={
        <AnalysisViewTabs
          value={search.view}
          options={viewOptions}
          aria-label="Character views"
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
          value={rankValue}
          ranks={search.view === "controls" ? getControlComparisonRanks(meta.ranks) : meta.ranks}
          onChange={(value) => {
            change({ rank: value })
          }}
        />
      ) : null}
      {showPlayerControl && input.view === "time" ? (
        <PlayerControlField
          value={input.playerControl}
          controls={meta.playerControls}
          onChange={(value) => {
            change({ playerControl: value })
          }}
        />
      ) : null}
      <CharacterMultiField
        label="Characters"
        value={search.characters}
        characters={meta.characters}
        className="sm:col-span-2 xl:col-span-2"
        onChange={(value) => {
          change({ characters: value })
        }}
        description="Select up to five characters to compare."
      />
    </AnalysisToolbar>
  )
  return (
    <AnalysisPage toolbar={toolbar} resetKey={getActiveInputKey(input)}>
      {hasSelectedCharacters(search.characters) ? (
        <CharacterQueryView input={input} meta={meta} />
      ) : (
        <AnalysisSelectionEmpty
          title="Select characters"
          description="Choose one or more characters to compare over time, ranks, or control styles."
        />
      )}
    </AnalysisPage>
  )
}

export { CharacterExplorerView }
