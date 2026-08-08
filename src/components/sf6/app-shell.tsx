import type { ReactNode } from "react"

import { Link, useLocation } from "@tanstack/react-router"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

type AppShellProps = {
  children: ReactNode
}

const AppShell = ({ children }: AppShellProps) => {
  const { pathname } = useLocation()
  const activeSection = pathname.startsWith("/roster")
    ? "roster"
    : pathname.startsWith("/characters")
      ? "characters"
      : pathname.startsWith("/matchups")
        ? "matchups"
        : pathname.startsWith("/changes")
          ? "changes"
          : null

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[1600px] flex-col">
      <header className="border-b border-border px-4 py-4 md:px-6">
        <NavigationMenu aria-label="Primary navigation" className="max-w-full">
          <NavigationMenuList className="flex-wrap justify-start">
            <NavigationMenuItem>
              <NavigationMenuLink
                active={activeSection === "roster"}
                aria-current={activeSection === "roster" ? "page" : undefined}
                render={<Link to="/roster" />}
              >
                Roster
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                active={activeSection === "characters"}
                aria-current={activeSection === "characters" ? "page" : undefined}
                render={<Link to="/characters" />}
              >
                Characters
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                active={activeSection === "matchups"}
                aria-current={activeSection === "matchups" ? "page" : undefined}
                render={<Link to="/matchups" />}
              >
                Matchups
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                active={activeSection === "changes"}
                aria-current={activeSection === "changes" ? "page" : undefined}
                render={<Link to="/changes" />}
              >
                Changes
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      <main id="main-content" className="flex-1 px-4 py-5 md:px-6">
        {children}
      </main>
      <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground md:px-6">
        Source: Capcom Buckler ranked battle-diagram and usage-rate snapshots. Usage share is a
        percentage of the population. Weighted results estimate environment relevance. They do not
        show match volume.
      </footer>
    </div>
  )
}

export { AppShell }
