"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LinkGithubAccount } from "@/components/account/link-github"
import { DeleteAccountDialog } from "@/components/account/delete-account-dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Github } from "lucide-react"

export default function AccountPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Check if user has a GitHub provider
  const hasGithubProvider = user.providerData.some((provider) => provider.providerId === "github.com")

  // Check if user has a password provider
  const hasPasswordProvider = user.providerData.some((provider) => provider.providerId === "password")

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <DashboardShell>
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground">Manage your account and connections</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || user.email || "User"} />
                  <AvatarFallback>
                    {user.displayName
                      ? user.displayName.substring(0, 2).toUpperCase()
                      : user.email
                        ? user.email.substring(0, 2).toUpperCase()
                        : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{user.displayName || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>Manage your connected accounts and services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">GitHub</h3>
                {hasGithubProvider ? (
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <LinkGithubAccount />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Email/Password</h3>
                <div className="flex items-center gap-2">
                  {hasPasswordProvider ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span className="text-sm">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-300"></div>
                      <span className="text-sm">Not connected</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <DeleteAccountDialog />
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </div>
  )
}
