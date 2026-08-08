import { createFileRoute, redirect } from "@tanstack/react-router"

const Route = createFileRoute("/_analytics/comparisons/")({
  beforeLoad: () => {
    throw redirect({ to: "/comparisons/trends" })
  },
})

export { Route }
