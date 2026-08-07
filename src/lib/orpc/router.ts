import { os } from "@orpc/server"
import * as z from "zod"

const HealthOutputSchema = z.object({
  status: z.literal("ok"),
})

const healthProcedure = os
  .input(z.void())
  .output(HealthOutputSchema)
  .handler(() => {
    return { status: "ok" }
  })

const router = {
  health: healthProcedure,
}

export { router }
