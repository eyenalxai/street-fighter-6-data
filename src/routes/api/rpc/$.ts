import { onError } from "@orpc/server"
import { RPCHandler } from "@orpc/server/fetch"
import { createFileRoute } from "@tanstack/react-router"

import { db } from "@/lib/database/client"
import { procedures } from "@/lib/orpc/procedures"

const handler = new RPCHandler(procedures, {
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
})

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const { response } = await handler.handle(request, {
          prefix: "/api/rpc",
          context: {
            db,
            headers: request.headers,
          },
        })

        return response ?? new Response("Not Found", { status: 404 })
      },
    },
  },
})
