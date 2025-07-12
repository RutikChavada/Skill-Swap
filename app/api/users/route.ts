import { type NextRequest, NextResponse } from "next/server"

// Mock user data - replace with database queries
const mockUsers = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    location: "San Francisco, CA",
    avatar: "/placeholder.svg?height=40&width=40",
    skillsOffered: ["React", "JavaScript", "UI/UX Design"],
    skillsWanted: ["Python", "Machine Learning"],
    rating: 4.8,
    completedSwaps: 12,
    isPublic: true,
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    location: "New York, NY",
    avatar: "/placeholder.svg?height=40&width=40",
    skillsOffered: ["Python", "Data Science", "Machine Learning"],
    skillsWanted: ["React", "Frontend Development"],
    rating: 4.9,
    completedSwaps: 8,
    isPublic: true,
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const skill = searchParams.get("skill")

  let filteredUsers = mockUsers.filter((user) => user.isPublic)

  if (skill) {
    filteredUsers = filteredUsers.filter((user) =>
      user.skillsOffered.some((s) => s.toLowerCase().includes(skill.toLowerCase())),
    )
  }

  return NextResponse.json({ users: filteredUsers })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, location, bio, skillsOffered, skillsWanted } = body

    // Mock user creation - replace with database insert
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      location,
      bio,
      skillsOffered,
      skillsWanted,
      rating: 0,
      completedSwaps: 0,
      isPublic: true,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, user: newUser })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
  }
}
