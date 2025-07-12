import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { swapRequestId, fromUserId, toUserId, rating, comment } = body

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Mock feedback creation
    const feedback = {
      id: Date.now().toString(),
      swapRequestId,
      fromUserId,
      toUserId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, feedback })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to submit feedback" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  // Mock feedback retrieval
  const mockFeedback = [
    {
      id: "1",
      fromUser: "Alice Johnson",
      rating: 5,
      comment: "Amazing teacher! Very patient and knowledgeable.",
      createdAt: "2024-03-15T10:00:00Z",
    },
  ]

  return NextResponse.json({ feedback: mockFeedback })
}
