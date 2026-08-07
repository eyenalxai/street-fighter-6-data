import { ORPCError, os } from "@orpc/server"
import { z } from "zod"

import type { db } from "@/lib/database/client"

import { auth } from "@/lib/auth/better-auth"

const authSessionSchema = z.object({
  userId: z.string(),
})

const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
})

const authSessionDataSchema = z.object({
  session: authSessionSchema,
  user: authUserSchema,
})

type AuthSession = z.infer<typeof authSessionSchema>
type AuthUser = z.infer<typeof authUserSchema>

const baseProcedure = os.$context<{ db: typeof db; headers: Headers }>()

const publicProcedure = baseProcedure

const authorizedProcedure = publicProcedure.use(async ({ context, next }) => {
  const sessionResult = await auth.api.getSession({
    headers: context.headers,
  })

  const parsedSessionResult = authSessionDataSchema.safeParse(sessionResult)

  if (!parsedSessionResult.success) {
    throw new ORPCError("UNAUTHORIZED")
  }

  return next({
    context: {
      ...context,
      session: parsedSessionResult.data.session,
      user: parsedSessionResult.data.user,
    },
  })
})

export { authorizedProcedure, baseProcedure, publicProcedure, type AuthSession, type AuthUser }
