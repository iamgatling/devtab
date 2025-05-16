"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { useAdmin } from "@/context/admin-context"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DeleteUserDialogProps {
  userId: string | null
  isOpen: boolean
  onClose: () => void
}

export function DeleteUserDialog({ userId, isOpen, onClose }: DeleteUserDialogProps) {
  const { deleteUserAccount, getUserDetails } = useAdmin()
  const [confirmation, setConfirmation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  // Fetch user details when dialog opens
  useState(() => {
    const fetchUserDetails = async () => {
      if (userId && isOpen) {
        const user = await getUserDetails(userId)
        if (user) {
          setUserName(user.displayName || user.email || "this user")
        }
      }
    }

    fetchUserDetails()
  })

  const handleDeleteUser = async () => {
    // Reset error state
    setError(null)

    // Validate confirmation text
    if (confirmation !== "DELETE") {
      setError('Please type "DELETE" to confirm user deletion')
      return
    }

    if (!userId) {
      setError("No user selected for deletion")
      return
    }

    setIsLoading(true)

    try {
      await deleteUserAccount(userId)

      // Close dialog and reset state
      setConfirmation("")
      onClose()
    } catch (error: any) {
      console.error("Delete user error:", error)
      setError(error.message || "Failed to delete user. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account and remove all their data from
            our servers.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            All user data including notes, goals, and settings will be permanently deleted. This action cannot be
            reversed.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type <span className="font-bold">DELETE</span> to confirm deleting {userName}
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
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteUser} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
