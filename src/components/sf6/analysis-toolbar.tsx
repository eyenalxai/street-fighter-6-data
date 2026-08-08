import type { ReactNode } from "react"

import { FieldGroup } from "@/components/ui/field"

type AnalysisToolbarProps = {
  title: string
  description?: ReactNode
  children: ReactNode
}

const AnalysisToolbar = ({ title, description, children }: AnalysisToolbarProps) => (
  <section className="sticky top-0 z-20 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description === undefined ? null : (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <FieldGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {children}
      </FieldGroup>
    </div>
  </section>
)

export { AnalysisToolbar }
