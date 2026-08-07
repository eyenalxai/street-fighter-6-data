import type { Transaction } from "@/lib/database/client"
import type { CreateStuffInput } from "@/lib/stuff/forms"

import { stuffs } from "@/lib/database/stuffs"

export const createStuff = async (tx: Transaction, input: CreateStuffInput, userId: string) => {
  const [newStuff] = await tx
    .insert(stuffs)
    .values({
      description: input.description,
      userId,
    })
    .returning()

  if (!newStuff) {
    throw new Error("Could not create stuff.")
  }

  return newStuff
}
