import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () =>
        new Response("ok", {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }),
      OPTIONS: () => new Response(null, { status: 200 }),
    },
  },
})
