import { ORPCError } from "@orpc/server"

import { authorizedProcedure, publicProcedure } from "@/lib/orpc/context"
import { listStuffsOutputSchema, stuffSchema } from "@/lib/stuff/feed"
import { createStuffSchema, updateStuffSchema } from "@/lib/stuff/forms"
import { createStuff } from "@/server/stuff/create-stuff"
import { listStuffs } from "@/server/stuff/list-stuff"
import { updateStuff } from "@/server/stuff/update-stuff"

const listStuffProcedure = publicProcedure
  .output(listStuffsOutputSchema)
  .handler(async ({ context }) => listStuffs(context.db))

const createStuffProcedure = authorizedProcedure
  .input(createStuffSchema)
  .output(stuffSchema)
  .handler(async ({ input, context }) => createStuff(context.db, input, context.user.id))

const updateStuffProcedure = authorizedProcedure
  .input(updateStuffSchema)
  .output(stuffSchema)
  .handler(async ({ input, context }) => {
    const updatedStuff = await updateStuff(context.db, input, context.user.id)

    if (updatedStuff === null) {
      throw new ORPCError("FORBIDDEN", {
        message: "You can only edit your own stuff.",
      })
    }

    return updatedStuff
  })

export const procedures = {
  stuff: {
    list: listStuffProcedure,
    create: createStuffProcedure,
    update: updateStuffProcedure,
  },
}

export type AppRouter = typeof procedures
