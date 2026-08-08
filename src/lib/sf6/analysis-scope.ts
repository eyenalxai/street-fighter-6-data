import type { PlayerControl } from "./model"
import type { RankId } from "./ranks"

import { getEffectivePlayerControl } from "./rank-selection"

type RosterMode = "snapshot" | "controls" | "landscape"
type CharacterMode = "time" | "ranks" | "controls"

const getRosterModePlayerControl = (
  rank: RankId,
  mode: RosterMode,
  requestedControl: PlayerControl,
): PlayerControl =>
  mode === "snapshot" ? getEffectivePlayerControl(rank, requestedControl) : "combined"

const getCharacterModePlayerControl = (
  rank: RankId,
  mode: CharacterMode,
  requestedControl: PlayerControl,
): PlayerControl =>
  mode === "time" ? getEffectivePlayerControl(rank, requestedControl) : "combined"

export { getCharacterModePlayerControl, getRosterModePlayerControl }
