import type { CharacterId, ControlMatchup, LeagueId, ReportingPeriod } from "./model"

const carryPeriod = (period: ReportingPeriod) => {
  return { period }
}

const carryRank = (league: LeagueId) => {
  return { league }
}

const carryControl = (controls: ControlMatchup) => {
  return { controls }
}

const toMatchupSearch = ({
  period,
  league,
  character,
  opponent,
  controls,
}: {
  period: ReportingPeriod
  league: LeagueId
  character: CharacterId
  opponent: CharacterId
  controls: ControlMatchup
}) => {
  return {
    ...carryPeriod(period),
    ...carryRank(league),
    character,
    opponent,
    opponentListControls: controls,
  }
}

const toCounterpickSearch = ({
  period,
  league,
  controls,
  opponents,
}: {
  period: ReportingPeriod
  league: LeagueId
  controls: ControlMatchup
  opponents: readonly CharacterId[]
}) => {
  return {
    ...carryPeriod(period),
    ...carryRank(league),
    ...carryControl(controls),
    opponents: [...opponents],
  }
}

const toTrendSearch = ({
  league,
  controls,
  characters,
}: {
  league: LeagueId
  controls: ControlMatchup
  characters: readonly CharacterId[]
}) => {
  return {
    ...carryRank(league),
    ...carryControl(controls),
    characters: [...characters],
  }
}

const toRankSearch = ({
  period,
  controls,
  character,
}: {
  period: ReportingPeriod
  controls: ControlMatchup
  character: CharacterId
}) => {
  return {
    ...carryPeriod(period),
    ...carryControl(controls),
    character,
  }
}

const toPeriodSearch = ({
  period,
  league,
  controls,
}: {
  period: ReportingPeriod
  league: LeagueId
  controls: ControlMatchup
}) => {
  return {
    toPeriod: period,
    ...carryRank(league),
    ...carryControl(controls),
  }
}

export {
  carryControl,
  carryPeriod,
  carryRank,
  toCounterpickSearch,
  toMatchupSearch,
  toPeriodSearch,
  toRankSearch,
  toTrendSearch,
}
