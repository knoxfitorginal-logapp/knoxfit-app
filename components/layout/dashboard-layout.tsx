"use client"

import type React from "react"
import { Navbar } from "./navbar"

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: {
    firstName: string
    lastName: string
    email: string
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
