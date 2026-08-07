import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { getFormErrorMessage } from "@/lib/form-errors"

interface DescriptionFieldProps {
  id: string
  value: string
  onBlur: () => void
  onChange: (value: string) => void
  error: unknown
}

export const DescriptionField = ({ id, value, onBlur, onChange, error }: DescriptionFieldProps) => {
  const errorMessage = getFormErrorMessage(error)
  const isInvalid = errorMessage !== null

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id}>Description</FieldLabel>
      <Textarea
        aria-invalid={isInvalid}
        id={id}
        name={id}
        onBlur={onBlur}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        placeholder="Write some stuff..."
        rows={5}
        value={value}
      />
      {isInvalid ? <FieldError>{errorMessage}</FieldError> : null}
    </Field>
  )
}
