/// <reference types="vite/client" />
import type { ReactNode } from "react"

import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router"

import type { RouterContext } from "@/lib/query-client"

import { Providers } from "@/components/providers"
import appCss from "@/styles.css?url"

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <HeadContent />
    </head>
    <body>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <Providers>{children}</Providers>
      <Scripts />
    </body>
  </html>
)

const RootComponent = () => (
  <RootDocument>
    <Outlet />
  </RootDocument>
)

const NotFound = () => (
  <main className="flex min-h-screen items-center justify-center">
    <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="text-muted-foreground">The requested analytics page does not exist.</p>
    </div>
  </main>
)

export const Route = createRootRouteWithContext<RouterContext>()({
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
          title: "SF6 Ranked Lab",
        },
        {
          name: "description",
          content: "Ranked Street Fighter 6 matchup analytics from Buckler reporting periods.",
        },
      ],
      links: [{ rel: "stylesheet", href: appCss }],
    }
  },
  component: RootComponent,
  notFoundComponent: NotFound,
})
