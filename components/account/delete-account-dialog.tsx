"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { useAuth } from "@/context/auth-context"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DeleteAccountDialog() {
  const { user, deleteAccount } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user has a password provider
  const hasPasswordProvider = user?.providerData.some((provider) => provider.providerId === "password")

  // Check if user has a GitHub provider
  const hasGithubProvider = user?.providerData.some((provider) => provider.providerId === "github.com")

  const handleDeleteAccount = async () => {
    // Reset error state
    setError(null)

    // Validate confirmation text
    if (confirmation !== "DELETE") {
      setError('Please type "DELETE" to confirm account deletion')
      return
    }

    // For password-based accounts, validate password
    if (hasPasswordProvider && !password) {
      setError("Please enter your password")
      return
    }

    setIsLoading(true)

    try {
      // Delete account with or without password based on provider
      if (hasPasswordProvider) {
        await deleteAccount(password)
      } else {
        await deleteAccount()
      }

      // Close dialog and redirect to login page
      setIsOpen(false)
      router.push("/login")
    } catch (error: any) {
      console.error("Delete account error:", error)
      setError(error.message || "Failed to delete account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove all your data from our
            servers.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            All your notes, goals, and settings will be permanently deleted. This action cannot be reversed.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasPasswordProvider && (
            <div className="space-y-2">
              <Label htmlFor="password">Enter your password to confirm</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your current password"
              />
            </div>
          )}

          {hasGithubProvider && !hasPasswordProvider && (
            <p className="text-sm text-muted-foreground">
              You'll be redirected to GitHub to confirm your identity before deleting your account.
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type <span className="font-bold">DELETE</span> to confirm
            </Label>
            <Input
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
