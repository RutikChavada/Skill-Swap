"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MapPin, Star, Users, MessageSquare, Shield, Bell } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { getUsers } from "@/lib/firestore" // Import the Firestore function
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/hooks/use-notifications" // New hook for notifications

export default function HomePage() {
  const { user, loading, logout, userProfile } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]) // Initialize as empty array
  const [isLoadingUsers, setIsLoadingUsers] = useState(true) // New loading state for users
  const { notifications, unreadCount, markNotificationAsRead } = useNotifications(user?.uid) // Use the new hook

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true) // Set loading to true before fetch
      const result = await getUsers(searchTerm)
      if (result.success) {
        setFilteredUsers(result.users)
      } else {
        console.error("Failed to fetch users:", result.error)
        setFilteredUsers(result.users || []) // Ensure it's an array even if result.users is undefined
      }
      setIsLoadingUsers(false) // Set loading to false after fetch
    }
    fetchUsers()
  }, [searchTerm])

  const handleLogout = async () => {
    await logout()
    router.push("/") // Redirect to home after logout
  }

  const getInitials = (name: string | undefined | null) => {
    if (!name) return "U"
    const parts = name.split(" ")
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name[0]?.toUpperCase() || "U"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">SkillSwap</h1>
            </div>
            <nav className="flex items-center space-x-4">
              {loading ? (
                <div className="h-8 w-20 animate-pulse bg-gray-200 rounded"></div>
              ) : user ? (
                <>
                  <Link href="/profile/my-profile">
                    <Button variant="ghost">My Profile</Button>
                  </Link>
                  <Link href="/requests">
                    <Button variant="ghost">Requests</Button>
                  </Link>
                  {/* Admin link if applicable */}
                  {userProfile?.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="ghost">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                            {unreadCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notifications.length === 0 ? (
                        <DropdownMenuItem className="text-gray-500">No new notifications.</DropdownMenuItem>
                      ) : (
                        notifications.map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className={`flex flex-col items-start space-y-1 ${!notification.read ? "bg-blue-50 font-medium" : ""}`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="text-sm">{notification.message}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(notification.timestamp.toDate()).toLocaleString()}
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button onClick={handleLogout}>Sign Out</Button>
                  <Link href="/profile/my-profile">
                    <Avatar>
                      <AvatarImage src={userProfile?.avatar || "/placeholder.svg"} alt={userProfile?.name} />
                      <AvatarFallback>{getInitials(userProfile?.name)}</AvatarFallback>
                    </Avatar>
                  </Link>
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

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Exchange Skills, Build Community</h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect with others to teach what you know and learn what you need. Join our community of skill sharers
            today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={user ? "/profile/my-profile" : "/auth"}>
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 bg-transparent">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for skills (e.g., React, Python, Photography...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>

          {/* User Cards */}
          {isLoadingUsers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Placeholder cards while loading */}
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                      <div>
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-48 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="flex flex-wrap gap-1">
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="flex flex-wrap gap-1">
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-8 w-24 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center text-gray-600 py-10">No users found matching your search.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Link href={`/profile/${user.id}`} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <CardDescription className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {user.location}
                        </CardDescription>
                      </div>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Offers:</h4>
                        <div className="flex flex-wrap gap-1">
                          {user.skillsOffered.map((skill: string, index: number) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Wants:</h4>
                        <div className="flex flex-wrap gap-1">
                          {user.skillsWanted.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{user.rating}</span>
                          <span className="text-sm text-gray-500">({user.completedSwaps} swaps)</span>
                        </div>
                        <Link href={`/profile/${user.id}`}>
                          <Button size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Join Our Growing Community</h3>
            <p className="text-lg text-gray-600">Thousands of skills exchanged every month</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">2,500+</div>
              <div className="text-gray-600">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">15,000+</div>
              <div className="text-gray-600">Skills Exchanged</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">4.8/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 mr-2" />
                <span className="text-xl font-bold">SkillSwap</span>
              </div>
              <p className="text-gray-400">Building communities through skill sharing and learning.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Safety
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Report Issue
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SkillSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
