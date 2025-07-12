"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, MapPin, Plus, X, Camera, Star, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { updateUser } from "@/lib/firestore"
import { useRouter } from "next/navigation"

export default function MyProfilePage() {
  console.log("MyProfilePage: Component loaded.") // Added log
  const { user, userProfile, loading, logout, refreshUserProfile } = useAuth()
  const router = useRouter()

  const [skillsOffered, setSkillsOffered] = useState<string[]>([])
  const [skillsWanted, setSkillsWanted] = useState<string[]>([])
  const [newSkillOffered, setNewSkillOffered] = useState("")
  const [newSkillWanted, setNewSkillWanted] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    bio: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      console.log("MyProfilePage useEffect: Not authenticated, redirecting to /auth") // Added log
      router.push("/auth")
    }
  }, [user, loading, router])

  // Load user data when available
  useEffect(() => {
    if (userProfile) {
      console.log("MyProfilePage useEffect: userProfile loaded:", userProfile) // Added log
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || user?.email || "",
        location: userProfile.location || "",
        bio: userProfile.bio || "",
      })
      setSkillsOffered(userProfile.skillsOffered || [])
      setSkillsWanted(userProfile.skillsWanted || [])
      setIsPublic(userProfile.isPublic !== false)
    } else if (user) {
      console.log("MyProfilePage useEffect: User exists but no userProfile, populating from auth.") // Added log
      // If no profile but user exists, populate from auth
      const displayName = user.displayName || ""
      const nameParts = displayName.split(" ")
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        location: "",
        bio: "",
      })
    }
  }, [userProfile, user])

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && !skillsOffered.includes(newSkillOffered.trim())) {
      setSkillsOffered([...skillsOffered, newSkillOffered.trim()])
      setNewSkillOffered("")
    }
  }

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !skillsWanted.includes(newSkillWanted.trim())) {
      setSkillsWanted([...skillsWanted, newSkillWanted.trim()])
      setNewSkillWanted("")
    }
  }

  const removeSkillOffered = (index: number) => {
    setSkillsOffered(skillsOffered.filter((_, i) => i !== index))
  }

  const removeSkillWanted = (index: number) => {
    setSkillsWanted(skillsWanted.filter((_, i) => i !== index))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setSaveMessage("")

    try {
      const updateData = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        skillsOffered,
        skillsWanted,
        isPublic,
      }

      const result = await updateUser(user.uid, updateData)

      if (result.success) {
        setSaveMessage("Profile updated successfully!")
        await refreshUserProfile()
      } else {
        setSaveMessage("Failed to update profile. Please try again.")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setSaveMessage("An error occurred while updating your profile.")
    }

    setIsSaving(false)
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/") // Redirect to home after logout
  }

  if (loading) {
    console.log("MyProfilePage: Displaying loading spinner.") // Added log
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log("MyProfilePage: User is null, returning null (will redirect).") // Added log
    return null // Will redirect to auth
  }

  const getInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || "U"
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
              <Link href="/requests">
                <Button variant="ghost">Requests</Button>
              </Link>
              {userProfile?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {saveMessage && (
          <Alert className="mb-6">
            <AlertDescription>{saveMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                  <AvatarFallback className="2xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <Button size="sm" className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle>
                {formData.firstName} {formData.lastName}
              </CardTitle>
              <CardDescription className="flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-1" />
                {formData.location || "Location not set"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Profile Visibility</span>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{userProfile?.rating || 0}</span>
                  </div>
                  <p className="text-sm text-gray-600">{userProfile?.completedSwaps || 0} completed swaps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update your profile information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    disabled // Email should not be editable here
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell others about yourself and your interests..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills I Offer</CardTitle>
                <CardDescription>Add skills you can teach or help others with</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {skillsOffered.map((skill, index) => (
                      <Badge key={index} variant="default" className="flex items-center gap-1">
                        {skill}
                        <button
                          onClick={() => removeSkillOffered(index)}
                          className="ml-1 hover:bg-red-500 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill you offer..."
                      value={newSkillOffered}
                      onChange={(e) => setNewSkillOffered(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSkillOffered()}
                    />
                    <Button onClick={addSkillOffered} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills I Want to Learn</CardTitle>
                <CardDescription>Add skills you'd like to learn from others</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {skillsWanted.map((skill, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {skill}
                        <button
                          onClick={() => removeSkillWanted(index)}
                          className="ml-1 hover:bg-red-500 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill you want to learn..."
                      value={newSkillWanted}
                      onChange={(e) => setNewSkillWanted(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSkillWanted()}
                    />
                    <Button onClick={addSkillWanted} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
