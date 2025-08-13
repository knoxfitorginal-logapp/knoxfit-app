import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { generateAIInsights, calculateConsistencyScore } from "@/lib/ai-tracking"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Generate AI insights for the user
    const insights = await generateAIInsights(decoded.userId)
    const consistencyScore = await calculateConsistencyScore(decoded.userId)

    return NextResponse.json({
      insights,
      consistencyScore,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Insights generation error:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
