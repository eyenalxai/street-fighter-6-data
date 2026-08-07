import type { CharacterId } from "@/lib/sf6/model"

import { getCharacter } from "@/lib/sf6/model"
import { cn } from "@/lib/utils"

type CharacterBadgeProps = {
  characterId: CharacterId
  size?: "small" | "default"
}

const CharacterBadge = ({ characterId, size = "default" }: CharacterBadgeProps) => {
  const character = getCharacter(characterId)
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-secondary font-mono font-semibold text-secondary-foreground",
        size === "small" ? "size-6 text-[0.6rem]" : "size-8 text-xs",
      )}
      aria-hidden="true"
    >
      {character?.short ?? characterId.slice(0, 3).toUpperCase()}
    </span>
  )
}

const CharacterName = ({ characterId }: { characterId: CharacterId }) =>
  getCharacter(characterId)?.name ?? characterId

export { CharacterBadge, CharacterName }
