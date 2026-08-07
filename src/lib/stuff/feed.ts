import { z } from "zod"

import { stuffDescriptionSchema } from "@/lib/stuff/forms"

const stuffSchema = z.object({
  uuid: z.uuid("Invalid stuff id"),
  userId: z.string(),
  description: stuffDescriptionSchema,
  createdAt: z.date(),
})

type Stuff = z.infer<typeof stuffSchema>

const stuffAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
})

const stuffWithAuthorSchema = stuffSchema.extend({
  user: stuffAuthorSchema.nullable(),
})

const listStuffsOutputSchema = z.array(stuffWithAuthorSchema)
type ListStuffsOutput = z.infer<typeof listStuffsOutputSchema>

export {
  listStuffsOutputSchema,
  stuffAuthorSchema,
  stuffSchema,
  stuffWithAuthorSchema,
  type ListStuffsOutput,
  type Stuff,
}
