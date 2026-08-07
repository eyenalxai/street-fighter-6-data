import { z } from "zod"

const stuffDescriptionSchema = z
  .string()
  .trim()
  .min(1, "Description is required")
  .max(500, "Description must be 500 characters or less")

const createStuffSchema = z.object({
  description: stuffDescriptionSchema,
})

type CreateStuffInput = z.infer<typeof createStuffSchema>

const updateStuffSchema = z.object({
  uuid: z.uuid("Invalid stuff id"),
  description: stuffDescriptionSchema,
})

type UpdateStuffInput = z.infer<typeof updateStuffSchema>

export {
  createStuffSchema,
  stuffDescriptionSchema,
  updateStuffSchema,
  type CreateStuffInput,
  type UpdateStuffInput,
}
