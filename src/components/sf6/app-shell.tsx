import type { ReactNode } from "react"

import { AppNav } from "@/components/sf6/app-nav"

type AppShellProps = {
  children: ReactNode
}

const AppShell = ({ children }: AppShellProps) => (
  <div className="mx-auto flex min-h-svh w-full max-w-[1600px] flex-col">
    <header className="border-b border-border px-4 pt-4 md:px-6">
      <AppNav />
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

export { AppShell }
