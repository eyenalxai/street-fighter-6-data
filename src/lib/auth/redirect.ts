import { z } from "zod"

const authRedirectSearchSchema = z.object({
  redirect: z.string().optional(),
})

const getSafeRedirect = (redirect: string | undefined, fallback: string) => {
  if (redirect === undefined || redirect === null || redirect === "") {
    return fallback
  }

  if (redirect.startsWith("/")) {
    return redirect
  }

  try {
    const url = new URL(redirect)
    const composedPath = `${url.pathname}${url.search}${url.hash}`
    return composedPath.startsWith("/") ? composedPath : fallback
  } catch {
    return fallback
  }
}

export { authRedirectSearchSchema, getSafeRedirect }
