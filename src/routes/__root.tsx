/// <reference types="vite/client" />
import type { ReactNode } from "react"

import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router"

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

const NotFound = () => (
  <main className="flex min-h-screen items-center justify-center">
    <p className="text-muted-foreground">Page not found</p>
  </main>
)

export const Route = createRootRoute({
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
          title: "Street Fighter 6 Data",
        },
      ],
      links: [{ rel: "stylesheet", href: appCss }],
    }
  },
  component: RootComponent,
  notFoundComponent: NotFound,
})
