import { X } from "lucide-react"
import { useId } from "react"

import type { CharacterId } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { CharacterIdSchema, getCharacterName } from "@/lib/sf6/model"
import { sortCharactersByName } from "@/lib/sf6/presentation"

const CharacterMultiField = ({
  label,
  value,
  characters,
  onChange,
  description,
  className,
  placeholder = "Search characters",
}: {
  label: string
  value: readonly CharacterId[]
  characters: MetaData["characters"]
  onChange: (value: CharacterId[]) => void
  description?: string
  className?: string
  placeholder?: string
}) => {
  const id = useId()
  const anchor = useComboboxAnchor()
  const sortedCharacters = sortCharactersByName(characters)

  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex min-w-0 items-start gap-2">
        <Combobox
          items={sortedCharacters.map((character) => character.id)}
          multiple
          value={[...value]}
          onValueChange={(nextValue) => {
            onChange(CharacterIdSchema.array().parse(nextValue))
          }}
          itemToStringLabel={(characterId) => getCharacterName(characterId)}
        >
          <ComboboxChips ref={anchor} className="min-w-0 flex-1">
            <ComboboxValue>
              {value.map((characterId) => (
                <ComboboxChip key={characterId}>{getCharacterName(characterId)}</ComboboxChip>
              ))}
            </ComboboxValue>
            <ComboboxChipsInput id={id} placeholder={placeholder} />
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
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
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => {
            onChange([])
          }}
          disabled={value.length === 0}
        >
          <X data-icon="inline-start" />
          Clear all
        </Button>
      </div>
      {description === undefined ? null : <FieldDescription>{description}</FieldDescription>}
    </Field>
  )
}

export { CharacterMultiField }
