import type { ReactNode } from "react"

import { ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"

const INITIAL_DIMENSION = { width: 640, height: 280 }

const ChartFrame = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("h-[320px] w-full", className)}>
    <ResponsiveContainer initialDimension={INITIAL_DIMENSION}>{children}</ResponsiveContainer>
  </div>
)

export { ChartFrame }
