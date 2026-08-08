"use client"

import type { ReactNode } from "react"

import { ThemeProvider as NextThemesProvider } from "next-themes"

import { Toaster } from "@/components/ui/toast"

export const Providers = ({ children }: { children: ReactNode }) => (
  <NextThemesProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <Toaster>{children}</Toaster>
  </NextThemesProvider>
)
