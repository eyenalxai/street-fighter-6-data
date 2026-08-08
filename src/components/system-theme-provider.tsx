"use client"

import type { ReactNode } from "react"

import { ThemeProvider as NextThemesProvider } from "next-themes"

const SystemThemeProvider = ({ children }: { children: ReactNode }) => (
  <NextThemesProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    {children}
  </NextThemesProvider>
)

export { SystemThemeProvider }
