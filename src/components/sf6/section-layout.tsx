import type { ReactNode } from "react"

import { Link, useLocation } from "@tanstack/react-router"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type SectionTab = {
  to: string
  label: string
}

type SectionLayoutProps = {
  title: string
  description: string
  tabs: readonly SectionTab[]
  children: ReactNode
}

const SectionLayout = ({ title, description, tabs, children }: SectionLayoutProps) => {
  const { pathname } = useLocation()
  const activeTab = tabs.find((tab) => pathname === tab.to)?.to ?? tabs[0]?.to

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1 border-b border-border pb-4">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Analytics
        </p>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </header>
      <Tabs value={activeTab}>
        <TabsList
          variant="line"
          aria-label={`${title} views`}
          className="max-w-full overflow-x-auto"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.to}
              value={tab.to}
              nativeButton={false}
              render={<Link to={tab.to} aria-current={activeTab === tab.to ? "page" : undefined} />}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {children}
    </div>
  )
}

export { SectionLayout, type SectionTab }
