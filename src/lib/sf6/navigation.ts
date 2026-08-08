import type { CharacterId, ControlMatchup, ReportingPeriod } from "./model"
import type { RankId } from "./ranks"

const carryPeriod = (period: ReportingPeriod) => {
  return { period }
}

const carryRank = (rank: RankId) => {
  return { rank }
}

const carryControl = (controls: ControlMatchup) => {
  return { controls }
}

const toMatchupSearch = ({
  period,
  rank,
  character,
  opponent,
  controls,
}: {
  period: ReportingPeriod
  rank: RankId
  character: CharacterId
  opponent: CharacterId
  controls: ControlMatchup
}) => {
  return {
    ...carryPeriod(period),
    ...carryRank(rank),
    character,
    opponent,
    opponentListControls: controls,
  }
}

const toCounterpickSearch = ({
  period,
  rank,
  controls,
  opponents,
}: {
  period: ReportingPeriod
  rank: RankId
  controls: ControlMatchup
  opponents: readonly CharacterId[]
}) => {
  return {
    ...carryPeriod(period),
    ...carryRank(rank),
    ...carryControl(controls),
    opponents: [...opponents],
  }
}

const toTrendSearch = ({
  rank,
  controls,
  characters,
}: {
  rank: RankId
  controls: ControlMatchup
  characters: readonly CharacterId[]
}) => {
  return {
    ...carryRank(rank),
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
  rank,
  controls,
}: {
  period: ReportingPeriod
  rank: RankId
  controls: ControlMatchup
}) => {
  return {
    toPeriod: period,
    ...carryRank(rank),
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
