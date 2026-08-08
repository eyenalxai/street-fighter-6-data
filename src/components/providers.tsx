"use client"

import type { ReactNode } from "react"

import { Toaster } from "@/components/ui/toast"

export const Providers = ({ children }: { children: ReactNode }) => <Toaster>{children}</Toaster>
