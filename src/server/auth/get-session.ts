import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth/better-auth"

const readSession = async () => auth.api.getSession({ headers: getRequest().headers })

export const getSession = createServerFn({ method: "GET" }).handler(async () => readSession())
