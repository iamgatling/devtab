"use client"

import { useEffect } from "react"
import { useAdmin } from "@/context/admin-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, ShieldAlert } from "lucide-react"

export default function AdminDashboard() {
  const { isAdmin, totalUsers, users, fetchUsers, loadingUsers } = useAdmin()

  useEffect(() => {
    if (isAdmin) {
      fetchUsers(1)
    }
  }, [isAdmin, fetchUsers])

  // Calculate stats
  const activeUsers = users.filter((user) => user.isActive).length
  const suspendedUsers = users.filter((user) => !user.isActive).length
  const adminUsers = users.filter((user) => user.isAdmin).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your application and user statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">Users with active accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspendedUsers}</div>
            <p className="text-xs text-muted-foreground">Users with suspended accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">Users with admin privileges</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Recent user registrations and logins</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center gap-4 border-b pb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : user.email
                          ? user.email.charAt(0).toUpperCase()
                          : "U"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{user.displayName || user.email || "Anonymous User"}</p>
                      <p className="text-sm text-muted-foreground">Joined {user.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{user.isAdmin ? "Admin" : "User"}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Authentication Methods</CardTitle>
            <CardDescription>How users are signing in</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span>Email/Password</span>
                  </div>
                  <span className="font-medium">
                    {users.filter((user) => user.authProviders.includes("password")).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-800"></div>
                    <span>GitHub</span>
                  </div>
                  <span className="font-medium">
                    {users.filter((user) => user.authProviders.includes("github.com")).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span>Multiple Methods</span>
                  </div>
                  <span className="font-medium">{users.filter((user) => user.authProviders.length > 1).length}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
