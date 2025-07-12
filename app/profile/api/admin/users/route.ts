import { type NextRequest, NextResponse } from "next/server"

// Mock admin data
const mockAdminUsers = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
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
    joinDate: "2024-02-20",
    status: "active",
    completedSwaps: 8,
    rating: 4.9,
    reportCount: 1,
  },
]

export async function GET(request: NextRequest) {
  // Check admin authorization (mock)
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.includes("admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")

  let users = mockAdminUsers
  if (search) {
    users = users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()),
    )
  }

  return NextResponse.json({ users })
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action } = body

    // Mock admin actions
    if (action === "ban") {
      return NextResponse.json({
        success: true,
        message: "User banned successfully",
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to perform action" }, { status: 500 })
  }
}
