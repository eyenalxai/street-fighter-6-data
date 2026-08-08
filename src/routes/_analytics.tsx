import { createFileRoute, Outlet } from "@tanstack/react-router"

import { AppShell } from "@/components/sf6/app-shell"
import { metaQueryOptions } from "@/lib/sf6/query-options"

const AnalyticsLayout = () => (
  <AppShell>
    <Outlet />
  </AppShell>
)

const Route = createFileRoute("/_analytics")({
  loader: async ({ context: { queryClient } }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    return { meta }
  },
  component: AnalyticsLayout,
})

export { Route }
