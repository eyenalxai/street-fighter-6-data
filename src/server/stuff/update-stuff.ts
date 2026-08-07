import { and, eq } from "drizzle-orm"

import type { Transaction } from "@/lib/database/client"
import type { UpdateStuffInput } from "@/lib/stuff/forms"

import { stuffs } from "@/lib/database/stuffs"

export const updateStuff = async (tx: Transaction, input: UpdateStuffInput, userId: string) => {
  const [updatedStuff] = await tx
    .update(stuffs)
    .set({
      description: input.description,
    })
    .where(and(eq(stuffs.uuid, input.uuid), eq(stuffs.userId, userId)))
    .returning()

  return updatedStuff ?? null
}
