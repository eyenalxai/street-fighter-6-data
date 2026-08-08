import type { Character } from "./model"

const CHARACTER_COLLATOR = new Intl.Collator("en-US", {
  sensitivity: "base",
})

const sortCharactersByName = <T extends Pick<Character, "name">>(characters: readonly T[]): T[] =>
  characters.toSorted((left, right) => CHARACTER_COLLATOR.compare(left.name, right.name))

export { sortCharactersByName }
