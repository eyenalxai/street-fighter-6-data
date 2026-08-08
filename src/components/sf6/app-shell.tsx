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
      <p>
        This site uses data from{" "}
        <a
          href="https://www.streetfighter.com/6/buckler/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          streetfighter.com/6/buckler
        </a>
        .
      </p>
      <p>
        You can find the source code at{" "}
        <a
          href="https://github.com/eyenalxai/street-fighter-6-data"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          github.com/eyenalxai/street-fighter-6-data
        </a>
        .
      </p>
    </footer>
  </div>
)

export { AppShell }
