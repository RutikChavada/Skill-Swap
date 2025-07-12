import { type NextRequest, NextResponse } from "next/server"

// Mock authentication - replace with real auth service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, action } = body

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (action === "signin") {
      // Mock sign in logic
      if (email && password) {
        return NextResponse.json({
          success: true,
          user: {
            id: "user1",
            email,
            name: "John Doe",
            token: "mock-jwt-token",
          },
        })
      }
    } else if (action === "signup") {
      // Mock sign up logic
      const { firstName, lastName } = body
      if (email && password && firstName && lastName) {
        return NextResponse.json({
          success: true,
          user: {
            id: "new-user-id",
            email,
            name: `${firstName} ${lastName}`,
            token: "mock-jwt-token",
          },
        })
      }
    }

    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
