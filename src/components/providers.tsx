"use client"

import type { ThemeProviderProps } from "next-themes"

import { ThemeProvider as NextThemesProvider } from "next-themes"

import { Toaster } from "@/components/ui/toast"

export const Providers = ({ children, ...props }: ThemeProviderProps) => (
  <NextThemesProvider {...props}>
    <Toaster>{children}</Toaster>
  </NextThemesProvider>
)
