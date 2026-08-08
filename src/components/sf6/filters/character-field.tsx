import { useId } from "react"

import type { CharacterId } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldLabel } from "@/components/ui/field"
import { CharacterIdSchema, getCharacterName } from "@/lib/sf6/model"
import { sortCharactersByName } from "@/lib/sf6/presentation"

const CharacterField = ({
  label,
  value,
  characters,
  onChange,
}: {
  label: string
  value: CharacterId
  characters: MetaData["characters"]
  onChange: (value: CharacterId) => void
}) => {
  const id = useId()
  const sortedCharacters = sortCharactersByName(characters)
  const items = sortedCharacters.map((character) => character.id)

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Combobox
        items={items}
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue !== null) {
            onChange(CharacterIdSchema.parse(nextValue))
          }
        }}
        itemToStringLabel={(characterId) => getCharacterName(characterId)}
      >
        <ComboboxInput id={id} className="w-full" placeholder="Search characters" />
        <ComboboxContent>
          <ComboboxEmpty>No matching characters.</ComboboxEmpty>
          <ComboboxList>
            {(characterId) => {
              const parsedCharacterId = CharacterIdSchema.parse(characterId)
              return (
                <ComboboxItem key={parsedCharacterId} value={parsedCharacterId}>
                  {getCharacterName(parsedCharacterId)}
                </ComboboxItem>
              )
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  )
}

export { CharacterField }
