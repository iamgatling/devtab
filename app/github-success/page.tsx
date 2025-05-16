"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { getUserProfile } from "@/lib/github"
import { GithubAuthProvider, signInWithCredential } from "firebase/auth"

export default function GitHubSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  useEffect(() => {
    async function saveGitHubToken() {
      const token = searchParams.get("token")

      if (!token) {
        router.push("/")
        return
      }

      try {
        // Sign in to Firebase using GitHub access token
        const credential = GithubAuthProvider.credential(token)
        const result = await signInWithCredential(auth, credential)

        // Get GitHub user profile
        const profile = await getUserProfile(token)

        // Save token and profile info to Firestore
        const userDocRef = doc(db, "users", result.user.uid)
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
            email: result.user.email,
            githubAccessToken: token,
            githubUsername: profile.login,
            githubAvatarUrl: profile.avatar_url,
            githubConnectedAt: new Date(),
          })
        }

        console.log("GitHub token:", token)
        console.log("Firebase user:", result.user)
        console.log("GitHub profile:", profile)

        const redirectUrl = sessionStorage.getItem("githubRedirectUrl") || "/"
        sessionStorage.removeItem("githubRedirectUrl")
        router.push(redirectUrl)
      } catch (error) {
        console.error("Error during GitHub login:", error)
        router.push("/github-error?error=save_failed")
      }
    }

    saveGitHubToken()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting to GitHub...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
}
