/// <reference types="vite/client" />
import type { QueryClient } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router"

import { Providers } from "@/components/providers"
import appCss from "@/styles.css?url"

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => (
  <html>
    <head>
      <HeadContent />
    </head>
    <body>
      <Providers attribute="class" defaultTheme="system" enableSystem>
        {children}
      </Providers>
      <Scripts />
    </body>
  </html>
)

const RootComponent = () => (
  <RootDocument>
    <Outlet />
  </RootDocument>
)

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => {
    return {
      meta: [
        {
          charSet: "utf8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: "TanStack Start Starter",
        },
      ],
      links: [{ rel: "stylesheet", href: appCss }],
    }
  },
  component: RootComponent,
})
