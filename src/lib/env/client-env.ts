import { createEnv } from "@t3-oss/env-core"
import * as z from "zod"

export const clientEnv = createEnv({
  client: {
    VITE_PUBLIC_APP_URL: z.url(),
  },
  clientPrefix: "VITE_",
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
  skipValidation: import.meta.env.VITE_BUILD_TIME === "true",
})
