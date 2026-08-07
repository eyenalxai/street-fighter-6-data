import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { orpc } from "@/lib/orpc/client"

const Home = () => {
  const health = useQuery(orpc.health.queryOptions())

  return (
    <main className="flex min-h-screen items-center justify-center">
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-semibold">oRPC fetch test</h1>
        {health.isPending ? <p>Loading health status...</p> : null}
        {health.isError ? (
          <p className="text-destructive">
            Request failed: {health.error instanceof Error ? health.error.message : "Unknown error"}
          </p>
        ) : null}
        {health.data ? <p>Server status: {health.data.status}</p> : null}
      </section>
    </main>
  )
}

export const Route = createFileRoute("/")({
  component: Home,
})
