"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface FloatingActionButtonProps {
  icon: LucideIcon
  onClick: () => void
  className?: string
  children?: React.ReactNode
}

export function FloatingActionButton({ icon: Icon, onClick, className = "", children }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 z-50 ${className}`}
    >
      <Icon className="h-6 w-6 text-white" />
      {children}
    </Button>
  )
}
