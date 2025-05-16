import type React from "react"
interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}
