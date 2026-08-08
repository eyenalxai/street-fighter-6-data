import { Link, useLocation } from "@tanstack/react-router"

const navItems = [
  { key: "roster", label: "Roster", to: "/roster" },
  { key: "characters", label: "Characters", to: "/characters" },
  { key: "matchups", label: "Matchups", to: "/matchups" },
  { key: "changes", label: "Changes", to: "/changes" },
] as const

type NavSection = (typeof navItems)[number]["key"]

const navLinkClassName =
  "inline-flex h-8 shrink-0 items-center rounded-none border-b-2 border-transparent px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground focus:bg-transparent data-[status=active]:border-foreground data-[status=active]:bg-transparent data-[status=active]:font-semibold data-[status=active]:text-foreground data-[status=active]:hover:bg-transparent data-[status=active]:focus:bg-transparent md:h-9 md:px-3 md:text-sm"

const activeOptions = { exact: false } as const

const getActiveSection = (pathname: string): NavSection | null => {
  const activeItem = navItems.find(({ to }) => pathname === to || pathname.startsWith(`${to}/`))

  return activeItem?.key ?? null
}

const AppNav = () => {
  const { pathname } = useLocation()
  const activeSection = getActiveSection(pathname)

  return (
    <nav aria-label="Primary navigation" className="w-full min-w-0">
      <ul className="-mb-px flex min-w-0 list-none items-center justify-start gap-0.5 md:gap-1">
        {navItems.map((item) => (
          <li key={item.key} className="shrink-0">
            <Link
              to={item.to}
              activeOptions={activeOptions}
              aria-current={activeSection === item.key ? "page" : undefined}
              className={navLinkClassName}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { AppNav }
