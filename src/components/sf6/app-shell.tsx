import type { ReactNode } from "react"

import { Link, useLocation } from "@tanstack/react-router"
import { Swords } from "lucide-react"

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
      <header className="flex flex-wrap items-center gap-4 border-b border-border px-4 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center bg-primary text-primary-foreground">
            <Swords aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold leading-tight tracking-tight">SF6 Ranked Lab</h1>
            <p className="truncate text-xs text-muted-foreground">
              Ranked matchup analytics from Buckler reporting periods
            </p>
          </div>
        </div>
        <NavigationMenu aria-label="Primary navigation" className="ml-auto max-w-full">
          <NavigationMenuList className="flex-wrap justify-end">
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
        Source: Capcom Buckler ranked battle-diagram and usage-rate snapshots. Usage is a percentage
        share; popularity-weighted results estimate environment relevance, not match volume.
      </footer>
    </div>
  )
}

export { AppShell }
