"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import {
  fetchUserIssues,
  fetchUserPullRequests,
  fetchUserRepos,
  getUserProfile,
  submitPullRequestReview,
  type GitHubIssue,
  type GitHubPullRequest,
  type GitHubRepo,
  type ReviewSubmission,
} from "@/lib/github"

interface GitHubContextType {
  isConnected: boolean
  isLoading: boolean
  issues: GitHubIssue[]
  pullRequests: GitHubPullRequest[]
  repos: GitHubRepo[]
  username: string | null
  avatarUrl: string | null
  selectedRepos: string[]
  connectGitHub: () => void
  disconnectGitHub: () => Promise<void>
  refreshIssues: () => Promise<void>
  refreshPullRequests: () => Promise<void>
  refreshRepos: () => Promise<void>
  toggleRepoFilter: (repoFullName: string) => Promise<void>
  clearRepoFilters: () => Promise<void>
  submitReview: (review: ReviewSubmission) => Promise<{ success: boolean; message: string }>
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined)

export function GitHubProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([])
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [username, setUsername] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [selectedRepos, setSelectedRepos] = useState<string[]>([])

  // Check if user has connected GitHub
  useEffect(() => {
    async function checkGitHubConnection() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists() && userDoc.data().githubAccessToken) {
          setAccessToken(userDoc.data().githubAccessToken)
          setIsConnected(true)

          // Set GitHub profile info if available
          if (userDoc.data().githubUsername) {
            setUsername(userDoc.data().githubUsername)
          }
          if (userDoc.data().githubAvatarUrl) {
            setAvatarUrl(userDoc.data().githubAvatarUrl)
          }
          if (userDoc.data().githubSelectedRepos) {
            setSelectedRepos(userDoc.data().githubSelectedRepos)
          }
        } else {
          setIsConnected(false)
        }
      } catch (error) {
        console.error("Error checking GitHub connection:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkGitHubConnection()
  }, [user])

  // Fetch issues, pull requests, and repos when access token changes
  useEffect(() => {
    if (accessToken && username) {
      refreshIssues()
      refreshPullRequests()
      refreshRepos()
    }
  }, [accessToken, username, selectedRepos])

  const refreshIssues = async () => {
    if (!accessToken) return

    setIsLoading(true)
    try {
      const fetchedIssues = await fetchUserIssues(accessToken, selectedRepos.length > 0 ? selectedRepos : undefined)
      setIssues(fetchedIssues)

      // Fetch user profile if we don't have it yet
      if (!username || !avatarUrl) {
        const profile = await getUserProfile(accessToken)
        setUsername(profile.login)
        setAvatarUrl(profile.avatar_url)

        // Save to Firestore
        if (user) {
          const userDocRef = doc(db, "users", user.uid)
          await updateDoc(userDocRef, {
            githubUsername: profile.login,
            githubAvatarUrl: profile.avatar_url,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching GitHub issues:", error)
      // If we get a 401 error, the token is invalid
      if (error instanceof Error && error.message.includes("401")) {
        await disconnectGitHub()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPullRequests = async () => {
    if (!accessToken || !username) return

    setIsLoading(true)
    try {
      const fetchedPRs = await fetchUserPullRequests(
        accessToken,
        username,
        selectedRepos.length > 0 ? selectedRepos : undefined,
      )
      setPullRequests(fetchedPRs)
    } catch (error) {
      console.error("Error fetching GitHub pull requests:", error)
      // If we get a 401 error, the token is invalid
      if (error instanceof Error && error.message.includes("401")) {
        await disconnectGitHub()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshRepos = async () => {
    if (!accessToken) return

    try {
      const fetchedRepos = await fetchUserRepos(accessToken)
      setRepos(fetchedRepos)
    } catch (error) {
      console.error("Error fetching GitHub repositories:", error)
    }
  }

  const toggleRepoFilter = async (repoFullName: string) => {
    if (!user) return

    let newSelectedRepos: string[]

    if (selectedRepos.includes(repoFullName)) {
      newSelectedRepos = selectedRepos.filter((repo) => repo !== repoFullName)
    } else {
      newSelectedRepos = [...selectedRepos, repoFullName]
    }

    setSelectedRepos(newSelectedRepos)

    // Save to Firestore
    try {
      const userDocRef = doc(db, "users", user.uid)
      await updateDoc(userDocRef, {
        githubSelectedRepos: newSelectedRepos,
      })
    } catch (error) {
      console.error("Error saving repository filters:", error)
    }
  }

  const clearRepoFilters = async () => {
    if (!user) return

    setSelectedRepos([])

    // Save to Firestore
    try {
      const userDocRef = doc(db, "users", user.uid)
      await updateDoc(userDocRef, {
        githubSelectedRepos: [],
      })
    } catch (error) {
      console.error("Error clearing repository filters:", error)
    }
  }

  const submitReview = async (review: ReviewSubmission) => {
    if (!accessToken) {
      return {
        success: false,
        message: "Not authenticated with GitHub",
      }
    }

    const result = await submitPullRequestReview(accessToken, review)

    if (result.success) {
      // Refresh pull requests to get updated review status
      await refreshPullRequests()
    }

    return result
  }

  const connectGitHub = () => {
    // Store the current URL to redirect back after auth
    sessionStorage.setItem("githubRedirectUrl", window.location.href)

    // Redirect to GitHub OAuth flow
    window.location.href = `/api/github/auth`
  }

  const disconnectGitHub = async () => {
    if (!user) return

    try {
      const userDocRef = doc(db, "users", user.uid)
      await updateDoc(userDocRef, {
        githubAccessToken: null,
        githubUsername: null,
        githubAvatarUrl: null,
        githubSelectedRepos: [],
      })

      setAccessToken(null)
      setIsConnected(false)
      setUsername(null)
      setAvatarUrl(null)
      setIssues([])
      setPullRequests([])
      setRepos([])
      setSelectedRepos([])
    } catch (error) {
      console.error("Error disconnecting GitHub:", error)
    }
  }

  return (
    <GitHubContext.Provider
      value={{
        isConnected,
        isLoading,
        issues,
        pullRequests,
        repos,
        username,
        avatarUrl,
        selectedRepos,
        connectGitHub,
        disconnectGitHub,
        refreshIssues,
        refreshPullRequests,
        refreshRepos,
        toggleRepoFilter,
        clearRepoFilters,
        submitReview,
      }}
    >
      {children}
    </GitHubContext.Provider>
  )
}

export const useGitHub = () => {
  const context = useContext(GitHubContext)
  if (context === undefined) {
    throw new Error("useGitHub must be used within a GitHubProvider")
  }
  return context
}
