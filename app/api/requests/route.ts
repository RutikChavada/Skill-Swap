import { type NextRequest, NextResponse } from "next/server"

// Mock request data
const mockRequests = {
  received: [
    {
      id: "1",
      from: {
        id: "user2",
        name: "Alice Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        skillsOffered: ["Python", "Machine Learning"],
      },
      skillWanted: "React",
      message: "Hi! I'd love to learn React from you. I can teach you Python and ML in return.",
      timestamp: "2 hours ago",
      status: "pending",
    },
  ],
  sent: [
    {
      id: "3",
      to: {
        id: "user3",
        name: "Carol Davis",
        avatar: "/placeholder.svg?height=40&width=40",
        skillsOffered: ["Guitar", "Music Production"],
      },
      skillWanted: "Guitar",
      message: "Hi Carol! I'd love to learn guitar from you. I can teach web development in return.",
      timestamp: "3 hours ago",
      status: "accepted",
    },
  ],
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") || "user1"

  // Mock fetching user's requests
  return NextResponse.json(mockRequests)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromUserId, toUserId, skillWanted, message } = body

    // Mock request creation
    const newRequest = {
      id: Date.now().toString(),
      fromUserId,
      toUserId,
      skillWanted,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, request: newRequest })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create request" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, status } = body

    // Mock request status update
    return NextResponse.json({
      success: true,
      message: `Request ${status} successfully`,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update request" }, { status: 500 })
  }
}
