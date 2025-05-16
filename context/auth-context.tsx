"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GithubAuthProvider,
  linkWithPopup,
  AuthErrorCodes,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth"
import { auth, githubProvider, db } from "@/lib/firebase"
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGithub: () => Promise<void>
  linkGithubAccount: () => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: (password?: string) => Promise<void>
  reauthenticate: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      // If user exists, ensure they have a document in Firestore
      if (user) {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (!userDoc.exists()) {
          // Create a new user document if it doesn't exist
          await setDoc(userDocRef, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date(),
          })
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signInWithGithub = async () => {
    try {
      // Configure GitHub provider to request necessary scopes
      githubProvider.addScope("user")
      githubProvider.addScope("repo")

      const result = await signInWithPopup(auth, githubProvider)

      // Get GitHub access token for API access
      const credential = GithubAuthProvider.credentialFromResult(result)
      const token = credential?.accessToken

      // Store GitHub token in Firestore for later API use
      if (token && result.user) {
        const userDocRef = doc(db, "users", result.user.uid)
        await setDoc(
          userDocRef,
          {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            githubAccessToken: token,
            githubUsername: result.user.reloadUserInfo.screenName,
            githubConnectedAt: new Date(),
          },
          { merge: true },
        )
      }
    } catch (error: any) {
      console.error("GitHub sign-in error:", error)
      throw error
    }
  }

  const linkGithubAccount = async () => {
    if (!user) throw new Error("No user logged in")

    try {
      // Configure GitHub provider to request necessary scopes
      githubProvider.addScope("user")
      githubProvider.addScope("repo")

      const result = await linkWithPopup(user, githubProvider)

      // Get GitHub access token for API access
      const credential = GithubAuthProvider.credentialFromResult(result)
      const token = credential?.accessToken

      // Store GitHub token in Firestore for later API use
      if (token) {
        const userDocRef = doc(db, "users", user.uid)
        await setDoc(
          userDocRef,
          {
            githubAccessToken: token,
            githubUsername: result.user.reloadUserInfo.screenName,
            githubConnectedAt: new Date(),
          },
          { merge: true },
        )
      }

      return result
    } catch (error: any) {
      // Handle account already exists error
      if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        throw new Error("This GitHub account is already linked to another user")
      }
      console.error("GitHub account linking error:", error)
      throw error
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  // Re-authenticate the user (required for sensitive operations like account deletion)
  const reauthenticate = async (password: string) => {
    if (!user) throw new Error("No user logged in")
    if (!user.email) throw new Error("User has no email")

    try {
      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)
    } catch (error: any) {
      console.error("Re-authentication error:", error)
      throw new Error("Failed to re-authenticate. Please check your password and try again.")
    }
  }

  // Delete user account and all associated data
  const deleteAccount = async (password?: string) => {
    if (!user) throw new Error("No user logged in")

    try {
      // If password is provided, re-authenticate with email/password
      if (password) {
        await reauthenticate(password)
      } else {
        // For GitHub users, re-authenticate with GitHub
        const isGithubUser = user.providerData.some((provider) => provider.providerId === "github.com")
        if (isGithubUser) {
          await reauthenticateWithPopup(user, githubProvider)
        } else {
          throw new Error("Password is required for account deletion")
        }
      }

      // Delete user data from Firestore
      await deleteUserData(user.uid)

      // Delete the user's authentication record
      await deleteUser(user)
    } catch (error: any) {
      console.error("Account deletion error:", error)
      throw error
    }
  }

  // Helper function to delete all user data from Firestore
  const deleteUserData = async (userId: string) => {
    try {
      // Delete user document
      await deleteDoc(doc(db, "users", userId))

      // Delete user's notes
      const notesRef = collection(db, "notes")
      const notesQuery = query(notesRef, where("userId", "==", userId))
      const notesSnapshot = await getDocs(notesQuery)
      for (const noteDoc of notesSnapshot.docs) {
        await deleteDoc(noteDoc.ref)
      }

      // Delete user's goals
      const goalsRef = collection(db, "goals")
      const goalsQuery = query(goalsRef, where("userId", "==", userId))
      const goalsSnapshot = await getDocs(goalsQuery)
      for (const goalDoc of goalsSnapshot.docs) {
        await deleteDoc(goalDoc.ref)
      }

      // Add more collections as needed
    } catch (error) {
      console.error("Error deleting user data:", error)
      throw new Error("Failed to delete user data")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signInWithGithub,
        linkGithubAccount,
        signOut,
        deleteAccount,
        reauthenticate,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
