"use client"

import { useState } from "react"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function LinkGithubAccount() {
  const { linkGithubAccount } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleLinkGithub = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await linkGithubAccount()
      setSuccess(true)
    } catch (error: any) {
      console.error("GitHub account linking error:", error)
      setError(error.message || "Failed to link GitHub account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription>GitHub account linked successfully!</AlertDescription>
        </Alert>
      )}

      <Button
        variant="outline"
        type="button"
        disabled={isLoading || success}
        className="w-full"
        onClick={handleLinkGithub}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
            Connecting...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <Github className="mr-2 h-4 w-4" />
            Link GitHub Account
          </span>
        )}
      </Button>
    </div>
  )
}
