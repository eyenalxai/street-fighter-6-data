import { createFileRoute, Outlet } from "@tanstack/react-router"

import { SectionLayout } from "@/components/sf6/section-layout"

const RosterSection = () => (
  <SectionLayout
    title="Roster"
    description="Compare characters by average win rate and player control style."
    tabs={[
      { to: "/roster", label: "Leaderboard" },
      { to: "/roster/controls", label: "Control styles" },
    ]}
  >
    <Outlet />
  </SectionLayout>
)

const Route = createFileRoute("/_analytics/roster")({
  component: RosterSection,
})

export { Route }
