import { createFileRoute, Outlet } from "@tanstack/react-router"

import { SectionLayout } from "@/components/sf6/section-layout"

const ComparisonsSection = () => (
  <SectionLayout
    title="Comparisons"
    description="Compare average win rates across reporting periods and rank tiers."
    tabs={[
      { to: "/comparisons/trends", label: "Trends" },
      { to: "/comparisons/ranks", label: "By rank" },
      { to: "/comparisons/periods", label: "Period changes" },
    ]}
  >
    <Outlet />
  </SectionLayout>
)

const Route = createFileRoute("/_analytics/comparisons")({
  component: ComparisonsSection,
})

export { Route }
