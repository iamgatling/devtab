"use client"

import { useEffect } from "react"
import { useAdmin } from "@/context/admin-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function PermissionsPage() {
  const { isAdmin, users, fetchUsers, loadingUsers } = useAdmin()

  useEffect(() => {
    if (isAdmin) {
      fetchUsers(1)
    }
  }, [isAdmin, fetchUsers])

  // Filter admin users
  const adminUsers = users.filter((user) => user.isAdmin)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
        <p className="text-muted-foreground">Manage user roles and permissions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.length}</div>
            <p className="text-xs text-muted-foreground">Users with administrative privileges</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length - adminUsers.length}</div>
            <p className="text-xs text-muted-foreground">Users with standard privileges</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>Users with administrative privileges</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auth Method</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingUsers ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : adminUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No admin users found.
                  </TableCell>
                </TableRow>
              ) : (
                adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.displayName || "Unnamed User"}</TableCell>
                    <TableCell>{user.email || "No email"}</TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Suspended
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.authProviders.includes("password") && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Email
                          </Badge>
                        )}
                        {user.authProviders.includes("github.com") && (
                          <Badge variant="outline" className="bg-gray-800 text-white">
                            GitHub
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Available permissions for each role</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Access Admin Panel</TableCell>
                <TableCell>✅</TableCell>
                <TableCell>❌</TableCell>
                <TableCell>Access to the admin dashboard and management tools</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Manage Users</TableCell>
                <TableCell>✅</TableCell>
                <TableCell>❌</TableCell>
                <TableCell>Create, edit, and delete user accounts</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Assign Admin Role</TableCell>
                <TableCell>✅</TableCell>
                <TableCell>❌</TableCell>
                <TableCell>Grant admin privileges to other users</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">View Analytics</TableCell>
                <TableCell>✅</TableCell>
                <TableCell>❌</TableCell>
                <TableCell>Access to usage statistics and analytics</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Manage Own Account</TableCell>
                <TableCell>✅</TableCell>
                <TableCell>✅</TableCell>
                <TableCell>Edit own profile and account settings</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Create Content</TableCell>
                <TableCell>✅</TableCell>
                <TableCell>✅</TableCell>
                <TableCell>Create notes, goals, and other content</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
