import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { tanstackStartCookies } from "better-auth/tanstack-start"

import * as betterAuthSchema from "@/lib/database/better-auth"
import { db } from "@/lib/database/client"
import * as stuffsSchema from "@/lib/database/stuffs"
import { serverEnv } from "@/lib/env/server-env"

export const auth = betterAuth({
  appName: "tanstack-template",
  session: {
    freshAge: 7 * 24 * 60 * 60, // 7 days
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...stuffsSchema, ...betterAuthSchema },
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [serverEnv.BETTER_AUTH_URL],
  plugins: [tanstackStartCookies()],
})
