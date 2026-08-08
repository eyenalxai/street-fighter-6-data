import { createFileRoute, Outlet } from "@tanstack/react-router"

import { SectionLayout } from "@/components/sf6/section-layout"

const MatchupsSection = () => (
  <SectionLayout
    title="Matchups"
    description="Inspect complete matchup profiles or plan counterpicks against selected opponents."
    tabs={[
      { to: "/matchups", label: "Head to head" },
      { to: "/matchups/counterpicks", label: "Counterpick planner" },
    ]}
  >
    <Outlet />
  </SectionLayout>
)

const Route = createFileRoute("/_analytics/matchups")({
  component: MatchupsSection,
})

export { Route }
