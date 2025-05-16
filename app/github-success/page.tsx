"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { getUserProfile } from "@/lib/github"

export default function GitHubSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  useEffect(() => {
    async function saveGitHubToken() {
      const token = searchParams.get("token")

      if (!token || !user) {
        router.push("/")
        return
      }

      try {
        // Get GitHub user profile
        const profile = await getUserProfile(token)

        // Save token and profile info to Firestore
        const userDocRef = doc(db, "users", user.uid)

        // Check if user document exists
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          await setDoc(
            userDocRef,
            {
              ...userDoc.data(),
              githubAccessToken: token,
              githubUsername: profile.login,
              githubAvatarUrl: profile.avatar_url,
              githubConnectedAt: new Date(),
            },
            { merge: true },
          )
        } else {
          await setDoc(userDocRef, {
            email: user.email,
            githubAccessToken: token,
            githubUsername: profile.login,
            githubAvatarUrl: profile.avatar_url,
            githubConnectedAt: new Date(),
          })
        }
        console.log("GitHub token:", token)
        console.log("Firebase user:", user)
        console.log("GitHub profile:", profile)

        // Redirect back to the dashboard
        const redirectUrl = sessionStorage.getItem("githubRedirectUrl") || "/"
        sessionStorage.removeItem("githubRedirectUrl")
        router.push(redirectUrl)
      } catch (error) {
        console.error("Error saving GitHub token:", error)
        router.push("/github-error?error=save_failed")
      }
    }

    saveGitHubToken()
  }, [user, router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting to GitHub...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
}
