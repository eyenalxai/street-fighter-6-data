import { createRouter } from "@tanstack/react-router"

import { routeTree } from "./routeTree.gen"

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}

export const getRouter = () =>
  createRouter({
    routeTree,
    scrollRestoration: true,
  })
