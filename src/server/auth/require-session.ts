import { createServerFn } from "@tanstack/react-start"
import { getRequest, setResponseStatus } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth/better-auth"

export const requireSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({ headers: getRequest().headers })

  if (!session) {
    setResponseStatus(401)
    throw new Error("Unauthorized")
  }

  return session
})
