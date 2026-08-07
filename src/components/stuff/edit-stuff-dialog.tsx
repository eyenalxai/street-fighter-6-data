import { useForm } from "@tanstack/react-form"

import { DescriptionField } from "@/components/stuff/description-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { createStuffSchema } from "@/lib/stuff/forms"

interface EditStuffDialogProps {
  open: boolean
  initialDescription: string
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (description: string) => void
}

export const EditStuffDialog = ({
  open,
  initialDescription,
  isPending,
  onOpenChange,
  onSubmit,
}: EditStuffDialogProps) => {
  const initialTrimmedDescription = initialDescription.trim()
  const form = useForm({
    defaultValues: {
      description: initialDescription,
    },
    validators: {
      onChange: createStuffSchema,
    },
    onSubmit: ({ value }) => {
      const trimmedDescription = value.description.trim()

      if (
        !createStuffSchema.safeParse(value).success ||
        trimmedDescription === initialTrimmedDescription
      ) {
        return
      }

      onSubmit(trimmedDescription)
    },
  })

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Stuff</DialogTitle>
          <DialogDescription>Update the description for your entry.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (isPending) {
              return
            }
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="description">
              {(field) => (
                <DescriptionField
                  error={field.state.meta.errors[0]}
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(v) => {
                    field.handleChange(v)
                  }}
                  value={field.state.value}
                />
              )}
            </form.Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              onClick={() => {
                onOpenChange(false)
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
