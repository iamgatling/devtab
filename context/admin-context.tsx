"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"

// Define user type for admin interface
export interface AdminUser {
  id: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: Date
  lastLoginAt?: Date
  isAdmin?: boolean
  isActive?: boolean
  authProviders: string[]
  githubUsername?: string
}

interface AdminContextType {
  isAdmin: boolean
  isLoading: boolean
  users: AdminUser[]
  totalUsers: number
  currentPage: number
  loadingUsers: boolean
  searchTerm: string
  setSearchTerm: (term: string) => void
  fetchUsers: (page?: number) => Promise<void>
  getUserDetails: (userId: string) => Promise<AdminUser | null>
  updateUserAdmin: (userId: string, isAdmin: boolean) => Promise<void>
  updateUserStatus: (userId: string, isActive: boolean) => Promise<void>
  deleteUserAccount: (userId: string) => Promise<void>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const USERS_PER_PAGE = 10

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Check if current user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  // Fetch total user count
  useEffect(() => {
    const fetchTotalUsers = async () => {
      if (!isAdmin) return

      try {
        const usersRef = collection(db, "users")
        const snapshot = await getDocs(usersRef)
        setTotalUsers(snapshot.size)
      } catch (error) {
        console.error("Error fetching total users:", error)
      }
    }

    if (isAdmin) {
      fetchTotalUsers()
    }
  }, [isAdmin])

  // Fetch users with pagination
  const fetchUsers = async (page = 1) => {
    if (!isAdmin) return

    setLoadingUsers(true)
    try {
      const usersRef = collection(db, "users")
      let q

      if (page === 1 || !lastVisible) {
        // First page or reset
        q = query(usersRef, orderBy("createdAt", "desc"), limit(USERS_PER_PAGE))
        setCurrentPage(1)
      } else {
        // Pagination using startAfter
        q = query(usersRef, orderBy("createdAt", "desc"), startAfter(lastVisible), limit(USERS_PER_PAGE))
        setCurrentPage(page)
      }

      const snapshot = await getDocs(q)

      // Set last visible document for pagination
      const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1]
      setLastVisible(lastVisibleDoc)

      // Map documents to user objects
      const usersList: AdminUser[] = []

      for (const doc of snapshot.docs) {
        const userData = doc.data()

        // Get auth providers from Firebase Auth (if available)
        let authProviders: string[] = []
        if (userData.authProviders) {
          authProviders = userData.authProviders
        } else {
          // Infer from available data
          if (userData.githubAccessToken) authProviders.push("github.com")
          if (userData.email && !userData.githubAccessToken) authProviders.push("password")
        }

        usersList.push({
          id: doc.id,
          email: userData.email || null,
          displayName: userData.displayName || null,
          photoURL: userData.photoURL || null,
          createdAt: userData.createdAt?.toDate() || new Date(),
          lastLoginAt: userData.lastLoginAt?.toDate(),
          isAdmin: userData.isAdmin || false,
          isActive: userData.isActive !== false, // Default to true if not set
          authProviders,
          githubUsername: userData.githubUsername,
        })
      }

      setUsers(usersList)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Get detailed user information
  const getUserDetails = async (userId: string): Promise<AdminUser | null> => {
    if (!isAdmin) return null

    try {
      const userDocRef = doc(db, "users", userId)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        return null
      }

      const userData = userDoc.data()

      // Infer auth providers
      let authProviders: string[] = []
      if (userData.authProviders) {
        authProviders = userData.authProviders
      } else {
        if (userData.githubAccessToken) authProviders.push("github.com")
        if (userData.email && !userData.githubAccessToken) authProviders.push("password")
      }

      return {
        id: userDoc.id,
        email: userData.email || null,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        createdAt: userData.createdAt?.toDate() || new Date(),
        lastLoginAt: userData.lastLoginAt?.toDate(),
        isAdmin: userData.isAdmin || false,
        isActive: userData.isActive !== false, // Default to true if not set
        authProviders,
        githubUsername: userData.githubUsername,
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
      return null
    }
  }

  // Update user admin status
  const updateUserAdmin = async (userId: string, isAdmin: boolean) => {
    if (!isAdmin) throw new Error("Unauthorized")

    try {
      const userDocRef = doc(db, "users", userId)
      await updateDoc(userDocRef, { isAdmin })

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, isAdmin } : user)))
    } catch (error) {
      console.error("Error updating user admin status:", error)
      throw error
    }
  }

  // Update user active status (suspend/activate)
  const updateUserStatus = async (userId: string, isActive: boolean) => {
    if (!isAdmin) throw new Error("Unauthorized")

    try {
      const userDocRef = doc(db, "users", userId)
      await updateDoc(userDocRef, { isActive })

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, isActive } : user)))
    } catch (error) {
      console.error("Error updating user status:", error)
      throw error
    }
  }

  // Delete user account (admin version)
  const deleteUserAccount = async (userId: string) => {
    if (!isAdmin) throw new Error("Unauthorized")

    try {
      // Delete user data from Firestore
      await deleteUserData(userId)

      // Update local state
      setUsers(users.filter((user) => user.id !== userId))
      setTotalUsers((prev) => prev - 1)
    } catch (error) {
      console.error("Error deleting user account:", error)
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
    <AdminContext.Provider
      value={{
        isAdmin,
        isLoading,
        users,
        totalUsers,
        currentPage,
        loadingUsers,
        searchTerm,
        setSearchTerm,
        fetchUsers,
        getUserDetails,
        updateUserAdmin,
        updateUserStatus,
        deleteUserAccount,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
