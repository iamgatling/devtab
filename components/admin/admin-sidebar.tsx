"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Settings, BarChart, Shield, Home } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/admin",
      label: "Overview",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      active: pathname === "/admin/users" || pathname.startsWith("/admin/users/"),
    },
    {
      href: "/admin/permissions",
      label: "Permissions",
      icon: Shield,
      active: pathname === "/admin/permissions",
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart,
      active: pathname === "/admin/analytics",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/admin/settings",
    },
  ]

  return (
    <div className="flex flex-col h-full space-y-2 py-4">
      <div className="px-3 py-2">
        <Link href="/">
          <Button variant="outline" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Admin Panel</h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <route.icon className="mr-2 h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
