import { createAuthClient } from "better-auth/react"

import { clientEnv } from "@/lib/env/client-env"

export const authClient = createAuthClient({
  baseURL: clientEnv.VITE_PUBLIC_APP_URL,
})
