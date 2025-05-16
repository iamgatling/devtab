"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAdmin } from "@/context/admin-context"
import { Search, Shield, ShieldOff, UserCheck, UserX, MoreHorizontal, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeleteUserDialog } from "@/components/admin/delete-user-dialog"

export default function UsersPage() {
  const {
    isAdmin,
    users,
    fetchUsers,
    loadingUsers,
    totalUsers,
    currentPage,
    updateUserAdmin,
    updateUserStatus,
    searchTerm,
    setSearchTerm,
  } = useAdmin()

  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      fetchUsers(1)
    }
  }, [isAdmin, fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    // This would typically filter users based on searchTerm
    console.log("Searching for:", searchTerm)
  }

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserAdmin(userId, !currentStatus)
    } catch (error) {
      console.error("Error toggling admin status:", error)
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserStatus(userId, !currentStatus)
    } catch (error) {
      console.error("Error toggling user status:", error)
    }
  }

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId)
    setIsDeleteDialogOpen(true)
  }

  const totalPages = Math.ceil(totalUsers / 10)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Auth Method</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingUsers ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || user.email || "User"} />
                        <AvatarFallback>
                          {user.displayName
                            ? user.displayName.substring(0, 2).toUpperCase()
                            : user.email
                              ? user.email.substring(0, 2).toUpperCase()
                              : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.displayName || "Unnamed User"}</span>
                    </div>
                  </TableCell>
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
                    {user.isAdmin ? (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
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
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleAdmin(user.id, user.isAdmin || false)}>
                          {user.isAdmin ? (
                            <>
                              <ShieldOff className="mr-2 h-4 w-4" />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Make Admin
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(user.id, user.isActive !== false)}>
                          {user.isActive ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend User
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate User
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers(currentPage - 1)}
          disabled={currentPage === 1 || loadingUsers}
        >
          Previous
        </Button>
        <div className="text-sm">
          Page {currentPage} of {totalPages || 1}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers(currentPage + 1)}
          disabled={currentPage >= totalPages || loadingUsers}
        >
          Next
        </Button>
      </div>

      {/* Delete User Dialog */}
      <DeleteUserDialog
        userId={userToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  )
}
