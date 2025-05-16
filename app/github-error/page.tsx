"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function GitHubErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "unknown_error"

  const errorMessages: Record<string, string> = {
    invalid_state: "Invalid state parameter. This could be due to a CSRF attack or an expired session.",
    no_code: "No authorization code received from GitHub.",
    access_denied: "You denied access to your GitHub account.",
    server_error: "A server error occurred while processing your request.",
    save_failed: "Failed to save your GitHub token.",
    unknown_error: "An unknown error occurred.",
  }

  const errorMessage = errorMessages[error] || errorMessages.unknown_error

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>GitHub Connection Failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
