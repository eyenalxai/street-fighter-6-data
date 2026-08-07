import type { RouterClient } from "@orpc/server"

import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import { createRouterClient } from "@orpc/server"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import type { AppRouter } from "@/lib/orpc/procedures"

import { db } from "@/lib/database/client"
import { procedures } from "@/lib/orpc/procedures"

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(procedures, {
      context: () => {
        return {
          db,
          headers: getRequest().headers,
        }
      },
    }),
  )
  .client((): RouterClient<AppRouter> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
    })

    return createORPCClient<RouterClient<AppRouter>>(link)
  })

const client = getORPCClient()

const orpc = createTanstackQueryUtils(client, {
  path: ["orpc"],
})

export { client, orpc }
