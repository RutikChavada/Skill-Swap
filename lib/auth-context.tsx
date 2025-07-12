"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { auth } from "./firebase" // Import auth
import { createUser, getUserById } from "./firestore"

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>
  logout: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

const useAuth = () => useContext(AuthContext)

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUserProfile = async () => {
    if (user) {
      const result = await getUserById(user.uid)
      if (result.success) {
        setUserProfile(result.user)
      }
    }
  }

  useEffect(() => {
    console.log("AuthContext: Checking Firebase auth object:", auth) // Log the auth object
    // Only proceed if auth object is available
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user)

        if (user) {
          // Fetch user profile from Firestore
          const result = await getUserById(user.uid)
          if (result.success) {
            setUserProfile(result.user)
          }
        } else {
          setUserProfile(null)
        }

        setLoading(false)
      })

      return unsubscribe
    } else {
      console.warn(
        "Auth object is not available, skipping onAuthStateChanged listener. Ensure Firebase environment variables are set.",
      )
      setLoading(false) // Ensure loading state is resolved even if auth is not available
    }
  }, []) // No dependencies needed here, as auth is a singleton import

  const signIn = async (email: string, password: string) => {
    if (!auth)
      return { success: false, error: "Authentication service not available. Please check Firebase configuration." }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: result.user }
    } catch (error: any) {
      console.error("Sign in error:", error)
      let errorMessage = "An unknown error occurred during sign-in."
      // Check if error is a FirebaseError (available globally)
      if (error && typeof error.code === "string" && error.code.startsWith("auth/")) {
        switch (error.code) {
          case "auth/invalid-credential":
            errorMessage = "Invalid email or password. Please try again."
            break
          case "auth/user-disabled":
            errorMessage = "Your account has been disabled. Please contact support."
            break
          case "auth/user-not-found":
            errorMessage = "No user found with this email. Please sign up or check your email."
            break
          case "auth/wrong-password": // Older error code, but good to include
            errorMessage = "Invalid email or password. Please try again."
            break
          case "auth/invalid-email":
            errorMessage = "The email address is not valid."
            break
          default:
            errorMessage = error.message // Fallback to Firebase's default message
        }
      }
      return { success: false, error: errorMessage }
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    if (!auth)
      return { success: false, error: "Authentication service not available. Please check Firebase configuration." }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const fullName = `${firstName} ${lastName}`

      // Update the user's display name
      await updateProfile(result.user, {
        displayName: fullName,
      })

      // Get user's location
      let location = ""
      try {
        const locationResponse = await fetch("https://ipapi.co/json/")
        const locationData = await locationResponse.json()
        location = `${locationData.city}, ${locationData.country_name}`
      } catch (error) {
        console.log("Could not fetch location:", error)
        location = "Location not available"
      }

      // Create user profile in Firestore using the user's UID
      const userResult = await createUser(result.user.uid, {
        name: fullName,
        firstName,
        lastName,
        email,
        location,
        skillsOffered: [],
        skillsWanted: [],
      })

      if (!userResult.success) {
        console.error("Error creating user profile:", userResult.error)
        // Don't fail the signup if profile creation fails
      }

      return { success: true, user: result.user }
    } catch (error: any) {
      console.error("Sign up error:", error)
      let errorMessage = "An unknown error occurred during sign-up."
      // Check if error is a FirebaseError (available globally)
      if (error && typeof error.code === "string" && error.code.startsWith("auth/")) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email address is already in use."
            break
          case "auth/invalid-email":
            errorMessage = "The email address is not valid."
            break
          case "auth/operation-not-allowed":
            errorMessage = "Email/password accounts are not enabled. Please contact support."
            break
          case "auth/weak-password":
            errorMessage = "The password is too weak. Please choose a stronger password."
            break
          default:
            errorMessage = error.message
        }
      }
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    if (!auth) {
      console.warn("Auth object is not available, cannot log out.")
      return
    }
    try {
      await signOut(auth)
      setUserProfile(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    refreshUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { useAuth, AuthProvider }
