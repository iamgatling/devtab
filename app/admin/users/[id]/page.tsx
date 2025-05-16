"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAdmin, type AdminUser } from "@/context/admin-context"
import { ArrowLeft, Shield, ShieldOff, UserCheck, UserX, Github, Mail, Calendar, Clock, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeleteUserDialog } from "@/components/admin/delete-user-dialog"

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const { isAdmin, getUserDetails, updateUserAdmin, updateUserStatus } = useAdmin()

  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!isAdmin) return

      setLoading(true)
      try {
        const userData = await getUserDetails(userId)
        setUser(userData)
      } catch (error) {
        console.error("Error fetching user details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [isAdmin, userId, getUserDetails])

  const handleToggleAdmin = async () => {
    if (!user) return

    try {
      await updateUserAdmin(user.id, !user.isAdmin)
      // Update local state
      setUser((prev) => (prev ? { ...prev, isAdmin: !prev.isAdmin } : null))
    } catch (error) {
      console.error("Error toggling admin status:", error)
    }
  }

  const handleToggleActive = async () => {
    if (!user) return

    try {
      await updateUserStatus(user.id, !user.isActive)
      // Update local state
      setUser((prev) => (prev ? { ...prev, isActive: !prev.isActive } : null))
    } catch (error) {
      console.error("Error toggling user status:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold">User Not Found</h2>
          <p className="text-muted-foreground">The user you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Basic user information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.photoURL || ""} alt={user.displayName || user.email || "User"} />
              <AvatarFallback className="text-2xl">
                {user.displayName
                  ? user.displayName.substring(0, 2).toUpperCase()
                  : user.email
                    ? user.email.substring(0, 2).toUpperCase()
                    : "U"}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{user.displayName || "Unnamed User"}</h2>
            <p className="text-muted-foreground">{user.email || "No email"}</p>

            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {user.isAdmin && <Badge className="bg-purple-100 text-purple-800 border-purple-200">Admin</Badge>}
              {user.isActive ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Suspended
                </Badge>
              )}
            </div>

            <div className="w-full mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span>{user.createdAt.toLocaleDateString()}</span>
              </div>
              {user.lastLoginAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last login:</span>
                  <span>{user.lastLoginAt.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant={user.isAdmin ? "outline" : "default"} className="w-full" onClick={handleToggleAdmin}>
              {user.isAdmin ? (
                <>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Remove Admin Role
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Make Admin
                </>
              )}
            </Button>
            <Button
              variant={user.isActive ? "outline" : "default"}
              className={`w-full ${!user.isActive ? "bg-green-600 hover:bg-green-700" : ""}`}
              onClick={handleToggleActive}
            >
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
            </Button>
            <Button variant="destructive" className="w-full mt-4" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </CardFooter>
        </Card>

        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>User authentication methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.authProviders.includes("password") && (
                  <div className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email/Password</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge className="ml-auto">Connected</Badge>
                  </div>
                )}

                {user.authProviders.includes("github.com") && (
                  <div className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Github className="h-5 w-5 text-gray-800" />
                    </div>
                    <div>
                      <h3 className="font-medium">GitHub</h3>
                      <p className="text-sm text-muted-foreground">{user.githubUsername || "Connected account"}</p>
                    </div>
                    <Badge className="ml-auto">Connected</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>User data and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="notes">
                <TabsList className="mb-4">
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                  <TabsTrigger value="activity">Activity Log</TabsTrigger>
                </TabsList>
                <TabsContent value="notes" className="space-y-4">
                  <p className="text-muted-foreground">
                    This would display the user's notes. In a real implementation, you would fetch and display the
                    user's notes here.
                  </p>
                </TabsContent>
                <TabsContent value="goals" className="space-y-4">
                  <p className="text-muted-foreground">
                    This would display the user's goals. In a real implementation, you would fetch and display the
                    user's goals here.
                  </p>
                </TabsContent>
                <TabsContent value="activity" className="space-y-4">
                  <p className="text-muted-foreground">
                    This would display the user's activity log. In a real implementation, you would track and display
                    user activity here.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete User Dialog */}
      <DeleteUserDialog userId={user.id} isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} />
    </div>
  )
}
