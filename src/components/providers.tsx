"use client"

import type { ReactNode } from "react"

import { SystemThemeProvider } from "@/components/system-theme-provider"
import { Toaster } from "@/components/ui/toast"

export const Providers = ({ children }: { children: ReactNode }) => (
  <SystemThemeProvider>
    <Toaster>{children}</Toaster>
  </SystemThemeProvider>
)
