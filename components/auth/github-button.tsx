"use client"

import { useState } from "react"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

interface GithubButtonProps {
  isSignUp?: boolean
  className?: string
}

export function GithubButton({ isSignUp = false, className }: GithubButtonProps) {
  const { signInWithGithub } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGithubSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await signInWithGithub()
    } catch (error: any) {
      console.error("GitHub sign-in error:", error)
      setError("Failed to sign in with GitHub. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      className={`w-full ${className}`}
      onClick={handleGithubSignIn}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
          Connecting...
        </span>
      ) : (
        <span className="flex items-center justify-center">
          <Github className="mr-2 h-4 w-4" />
          {isSignUp ? "Sign up with GitHub" : "Sign in with GitHub"}
        </span>
      )}
    </Button>
  )
}
