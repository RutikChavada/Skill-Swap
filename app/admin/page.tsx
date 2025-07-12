"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Shield, AlertTriangle, CheckCircle, XCircle, Search, Download, Bell, Ban, Eye } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context" // Import useAuth

// Mock data for admin panel (keep as is for now, will be replaced by Firestore later)
const mockUsers = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "2024-01-15",
    status: "active",
    completedSwaps: 12,
    rating: 4.8,
    reportCount: 0,
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "2024-02-20",
    status: "active",
    completedSwaps: 8,
    rating: 4.9,
    reportCount: 1,
  },
  {
    id: "3",
    name: "Suspicious User",
    email: "suspicious@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    joinDate: "2024-03-01",
    status: "flagged",
    completedSwaps: 0,
    rating: 0,
    reportCount: 3,
  },
]

const mockReports = [
  {
    id: "1",
    reporter: "Alice Johnson",
    reported: "Suspicious User",
    reason: "Inappropriate behavior",
    description: "User was sending inappropriate messages during skill exchange sessions.",
    timestamp: "2 hours ago",
    status: "pending",
  },
  {
    id: "2",
    reporter: "Bob Smith",
    reported: "John Doe",
    reason: "Spam",
    description: "User is sending spam messages to multiple people.",
    timestamp: "1 day ago",
    status: "resolved",
  },
]

const mockSwaps = [
  {
    id: "1",
    participants: ["Alice Johnson", "Bob Smith"],
    skills: "React ↔ Python",
    status: "completed",
    startDate: "2024-03-01",
    completedDate: "2024-03-15",
  },
  {
    id: "2",
    participants: ["Carol Davis", "David Wilson"],
    skills: "Photography ↔ Guitar",
    status: "active",
    startDate: "2024-03-10",
    completedDate: null,
  },
]

export default function AdminPage() {
  const { user, loading, logout, userProfile } = useAuth() // Get auth context
  const [searchTerm, setSearchTerm] = useState("")
  const [notification, setNotification] = useState("")

  const handleBanUser = (userId: string) => {
    console.log("Banning user:", userId)
    setNotification("User has been banned successfully")
    setTimeout(() => setNotification(""), 3000)
  }

  const handleApproveReport = (reportId: string) => {
    console.log("Approving report:", reportId)
    setNotification("Report has been approved and action taken")
    setTimeout(() => setNotification(""), 3000)
  }

  const handleRejectReport = (reportId: string) => {
    console.log("Rejecting report:", reportId)
    setNotification("Report has been rejected")
    setTimeout(() => setNotification(""), 3000)
  }

  const handleSendNotification = () => {
    console.log("Sending platform-wide notification")
    setNotification("Notification sent to all users")
    setTimeout(() => setNotification(""), 3000)
  }

  const handleDownloadLogs = () => {
    console.log("Downloading CSV logs")
    // Simulate CSV download
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "User,Email,Join Date,Completed Swaps,Rating,Status\n" +
      mockUsers
        .map(
          (user) => `${user.name},${user.email},${user.joinDate},${user.completedSwaps},${user.rating},${user.status}`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "skillswap_users.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleLogout = async () => {
    await logout()
    // Redirect to home or auth page after logout
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Optional: Redirect if not admin or not logged in
  if (!user || userProfile?.role !== "admin") {
    // You might want a more sophisticated redirect or error page here
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
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
              <h1 className="text-2xl font-bold text-gray-900">SkillSwap Admin</h1>
            </Link>
            <nav className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Admin Panel
              </Badge>
              <Link href="/profile/my-profile">
                <Button variant="ghost">My Profile</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {notification && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{notification}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">2,547</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Swaps</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Ban className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Banned Users</p>
                  <p className="text-2xl font-bold text-gray-900">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleSendNotification} className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Send Platform Notification
              </Button>
              <Button onClick={handleDownloadLogs} variant="outline" className="flex items-center bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download User Logs (CSV)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="reports">Reports & Moderation</TabsTrigger>
            <TabsTrigger value="swaps">Swap Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage platform users and their accounts</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">Joined: {user.joinDate}</span>
                            <span className="text-xs text-gray-500">Swaps: {user.completedSwaps}</span>
                            <span className="text-xs text-gray-500">Rating: {user.rating}/5</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                        {user.reportCount > 0 && (
                          <Badge variant="outline" className="text-yellow-600">
                            {user.reportCount} reports
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleBanUser(user.id)}>
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Moderation</CardTitle>
                <CardDescription>Review and moderate user reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReports.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">
                            {report.reporter} reported {report.reported}
                          </h4>
                          <p className="text-sm text-gray-600">{report.timestamp}</p>
                        </div>
                        <Badge variant={report.status === "pending" ? "secondary" : "default"}>{report.status}</Badge>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">Reason: {report.reason}</p>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      </div>
                      {report.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => handleApproveReport(report.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRejectReport(report.id)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="swaps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Swap Monitoring</CardTitle>
                <CardDescription>Monitor ongoing and completed skill swaps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSwaps.map((swap) => (
                    <div key={swap.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{swap.participants.join(" ↔ ")}</h4>
                          <p className="text-sm text-gray-600">Skills: {swap.skills}</p>
                          <p className="text-sm text-gray-600">
                            Started: {swap.startDate}
                            {swap.completedDate && ` • Completed: ${swap.completedDate}`}
                          </p>
                        </div>
                        <Badge variant={swap.status === "completed" ? "default" : "secondary"}>{swap.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
