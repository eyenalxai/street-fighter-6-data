import { useMemo } from "react"

import type { MetaData } from "@/lib/sf6/query-options"
import type { DashboardSearch } from "@/lib/sf6/search"

import {
  CharacterIdSchema,
  ControlMatchupSchema,
  LeagueIdSchema,
  ReportingPeriodSchema,
  formatReportingPeriod,
} from "@/lib/sf6/model"

import { LabeledSelect } from "./labeled-select"

type FilterBarProps = {
  search: DashboardSearch
  period: DashboardSearch["period"] extends string | undefined ? string : never
  meta: MetaData
  onChange: (changes: Partial<DashboardSearch>) => void
}

const FilterBar = ({ search, period, meta, onChange }: FilterBarProps) => {
  const periodOptions = useMemo(
    () =>
      meta.periods.map((value) => {
        return { value, label: formatReportingPeriod(value) }
      }),
    [meta.periods],
  )
  const leagueOptions = useMemo(
    () =>
      meta.leagues.map(({ id: value, label }) => {
        return { value, label }
      }),
    [meta.leagues],
  )
  const characterOptions = useMemo(
    () =>
      meta.characters.map(({ id: value, name: label }) => {
        return { value, label }
      }),
    [meta.characters],
  )
  const controlOptions = useMemo(
    () =>
      meta.controls.map(({ id: value, label }) => {
        return { value, label }
      }),
    [meta.controls],
  )

  const updatePeriod = (value: string): void => {
    const parsed = ReportingPeriodSchema.safeParse(value)
    if (parsed.success) {
      onChange({ period: parsed.data })
    }
  }
  const updateLeague = (value: string): void => {
    const parsed = LeagueIdSchema.safeParse(value)
    if (parsed.success) {
      onChange({ league: parsed.data })
    }
  }
  const updateCharacter = (key: "character" | "opponent", value: string): void => {
    const parsed = CharacterIdSchema.safeParse(value)
    if (parsed.success) {
      onChange({ [key]: parsed.data })
    }
  }
  const updateControls = (value: string): void => {
    const parsed = ControlMatchupSchema.safeParse(value)
    if (parsed.success) {
      onChange({ controls: parsed.data })
    }
  }

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <LabeledSelect
          label="Reporting period"
          value={period}
          options={periodOptions}
          onChange={updatePeriod}
        />
        <LabeledSelect
          label="Rank"
          value={search.league}
          options={leagueOptions}
          onChange={updateLeague}
        />
        <LabeledSelect
          label="Character"
          value={search.character}
          options={characterOptions}
          onChange={(value) => {
            updateCharacter("character", value)
          }}
        />
        <LabeledSelect
          label="Opponent"
          value={search.opponent}
          options={characterOptions}
          onChange={(value) => {
            updateCharacter("opponent", value)
          }}
        />
        <LabeledSelect
          label="Controls"
          value={search.controls}
          options={controlOptions}
          onChange={updateControls}
        />
      </div>
    </div>
  )
}

export { FilterBar }
