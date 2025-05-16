"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/context/admin-context"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAdmin, isLoading } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/")
    }
  }, [isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 mt-16 border-r">
          <AdminSidebar />
        </div>
        <main className="md:ml-64 flex-1 p-6 pt-16">{children}</main>
      </div>
    </div>
  )
}
