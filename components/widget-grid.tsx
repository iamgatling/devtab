import type React from "react"
interface WidgetGridProps {
  children: React.ReactNode
}

export function WidgetGrid({ children }: WidgetGridProps) {
  return <div className="grid gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>
}
