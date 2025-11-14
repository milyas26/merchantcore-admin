import * as React from "react"
import { AppLayout } from "@/components/app-layout"

interface ProtectedLayoutProps {
  children: React.ReactNode
  breadcrumbs?: {
    title: string
    href?: string
  }[]
}

export function ProtectedLayout({ children, breadcrumbs = [] }: ProtectedLayoutProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {children}
    </AppLayout>
  )
}