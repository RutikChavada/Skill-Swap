"use client"
import { Shield } from "lucide-react" // Import Shield here

import { useState, useEffect, useCallback } from "react" // Import useCallback
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MapPin, Star } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getUserById, createSwapRequest } from "@/lib/firestore"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params
  const { user, loading: authLoading, userProfile: currentUserProfile } = useAuth()
  const router = useRouter()

  const [profileData, setProfileData] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [requestMessage, setRequestMessage] = useState("")
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [requestStatus, setRequestStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  console.log(`UserProfilePage: Rendering for userId: ${userId}`)
  console.log(`UserProfilePage: authLoading: ${authLoading}, isLoadingProfile: ${isLoadingProfile}`)

  // Memoize fetchUserProfile to prevent unnecessary re-creations
  const fetchUserProfile = useCallback(
    async (id: string) => {
      setIsLoadingProfile(true)
      console.log(`UserProfilePage fetchUserProfile: Starting fetch for user ID: ${id}`)
      const result = await getUserById(id)
      if (result.success) {
        setProfileData(result.user)
        console.log("UserProfilePage fetchUserProfile: Fetched user profile successfully:", result.user)
      } else {
        console.error("UserProfilePage fetchUserProfile: Failed to fetch user profile:", result.error)
        // Only redirect if the user is not found, not for other errors that might be temporary
        if (result.error === "User not found") {
          router.push("/") // Redirect to home for now if user not found
        }
      }
      setIsLoadingProfile(false)
      console.log("UserProfilePage fetchUserProfile: Finished fetching profile.")
    },
    [router],
  ) // Dependency on router

  useEffect(() => {
    console.log(`UserProfilePage useEffect: userId changed to ${userId}`)

    // FIRST: Handle the special "my-profile" case
    if (userId === "my-profile") {
      console.log("UserProfilePage useEffect: Detected 'my-profile', redirecting to /profile/my-profile")
      router.replace("/profile/my-profile")
      setIsLoadingProfile(false) // Stop loading as we are redirecting
      return // Exit early
    }

    // THEN: If it's not "my-profile", proceed with fetching the user profile
    if (userId) {
      fetchUserProfile(userId)
    } else {
      console.log(
        "UserProfilePage useEffect: userId is null or undefined (not 'my-profile'), skipping fetchUserProfile.",
      )
      setIsLoadingProfile(false) // Ensure loading state is false if no valid userId
    }
  }, [userId, router, fetchUserProfile]) // Dependencies: userId, router, fetchUserProfile

  const handleSendRequest = async () => {
    if (!user) {
      setRequestStatus({ type: "error", message: "Please sign in to send a swap request." })
      setTimeout(() => setRequestStatus(null), 3000)
      return
    }
    if (!requestMessage.trim()) {
      setRequestStatus({ type: "error", message: "Please enter a message for your request." })
      setTimeout(() => setRequestStatus(null), 3000)
      return
    }
    if (user.uid === userId) {
      setRequestStatus({ type: "error", message: "You cannot send a swap request to yourself." })
      setTimeout(() => setRequestStatus(null), 3000)
      return
    }

    setIsSendingRequest(true)
    setRequestStatus(null)

    try {
      const result = await createSwapRequest({
        fromUserId: user.uid,
        toUserId: userId,
        skillWanted: "N/A (Specify in message)", // User can specify in message
        message: requestMessage.trim(),
      })

      if (result.success) {
        setRequestStatus({ type: "success", message: "Swap request sent successfully!" })
        setRequestMessage("")
      } else {
        setRequestStatus({ type: "error", message: result.error || "Failed to send swap request." })
      }
    } catch (error) {
      console.error("Error sending swap request:", error)
      setRequestStatus({ type: "error", message: "An unexpected error occurred." })
    } finally {
      setIsSendingRequest(false)
      setTimeout(() => setRequestStatus(null), 3000)
    }
  }

  const getInitials = (name: string | undefined | null) => {
    // Made robust to handle undefined/null
    if (!name) return "U"
    const parts = name.split(" ")
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name[0]?.toUpperCase() || "U"
  }

  if (isLoadingProfile || authLoading) {
    console.log("UserProfilePage: Displaying loading spinner.")
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    console.log("UserProfilePage: No profile data, displaying 'Profile Not Found'.")
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">The user profile you are looking for does not exist or is private.</p>
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">SkillSwap</h1>
            </Link>
            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/profile/my-profile">
                    <Button variant="ghost">My Profile</Button>
                  </Link>
                  <Link href="/requests">
                    <Button variant="ghost">Requests</Button>
                  </Link>
                  {/* Admin link if applicable */}
                  {currentUserProfile?.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="ghost">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button onClick={() => router.push("/auth?logout=true")}>Sign Out</Button>
                  <Avatar>
                    <AvatarImage
                      src={currentUserProfile?.avatar || "/placeholder.svg"}
                      alt={currentUserProfile?.name}
                    />
                    <AvatarFallback>{getInitials(currentUserProfile?.name || "")}</AvatarFallback>
                  </Avatar>
                </>
              ) : (
                <Link href="/auth">
                  <Button>Sign In</Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={profileData.avatar || "/placeholder.svg?height=96&width=96"}
                    alt={profileData.name}
                  />
                  <AvatarFallback className="2xl">{getInitials(profileData.name)}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{profileData.name}</CardTitle>
              <CardDescription className="flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-1" />
                {profileData.location || "Location not set"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{profileData.rating || 0}</span>
                  </div>
                  <p className="text-sm text-gray-600">{profileData.completedSwaps || 0} completed swaps</p>
                </div>
                {profileData.bio && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Bio:</h4>
                    <p className="text-sm text-gray-600">{profileData.bio}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Details and Connect Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills Offered</CardTitle>
                <CardDescription>Skills this user can teach or help with</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileData.skillsOffered && profileData.skillsOffered.length > 0 ? (
                    profileData.skillsOffered.map((skill: string, index: number) => (
                      <Badge key={index} variant="default" className="text-sm">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No skills offered yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Wanted</CardTitle>
                <CardDescription>Skills this user wants to learn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileData.skillsWanted && profileData.skillsWanted.length > 0 ? (
                    profileData.skillsWanted.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No skills wanted yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {user &&
              user.uid !== userId && ( // Only show connect form if logged in and not viewing own profile
                <Card>
                  <CardHeader>
                    <CardTitle>Send Swap Request</CardTitle>
                    <CardDescription>Propose a skill exchange with {profileData.firstName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {requestStatus && (
                      <Alert variant={requestStatus.type === "error" ? "destructive" : "default"}>
                        <AlertDescription>{requestStatus.message}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="requestMessage">Your Message</Label>
                      <Textarea
                        id="requestMessage"
                        placeholder={`Hi ${profileData.firstName}, I'm interested in learning [skill] from you. I can offer [your skill] in return. Let me know if you're interested!`}
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        rows={5}
                      />
                    </div>
                    <Button onClick={handleSendRequest} disabled={isSendingRequest}>
                      {isSendingRequest ? "Sending Request..." : "Send Swap Request"}
                    </Button>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
