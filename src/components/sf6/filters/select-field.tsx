import { useId } from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SelectFieldProps = {
  label: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
  description?: string
}

const SelectField = ({ label, value, options, onChange, description }: SelectFieldProps) => {
  const id = useId()

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={options}
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue !== null) {
            onChange(nextValue)
          }
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {description === undefined ? null : <FieldDescription>{description}</FieldDescription>}
    </Field>
  )
}

export { SelectField }
