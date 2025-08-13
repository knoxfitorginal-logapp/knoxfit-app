import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

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

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type") // "workout" | "diet" | null

    // Build query
    const query: any = { userId: decoded.userId }
    if (type && (type === "workout" || type === "diet")) {
      query.type = type
    }

    // Fetch logs from database
    const client = await clientPromise
    const db = client.db("knoxfit")
    const logs = await db.collection("workout_logs").find(query).sort({ timestamp: -1 }).limit(limit).toArray()

    // Transform logs for response
    const transformedLogs = logs.map((log) => ({
      id: log._id.toString(),
      type: log.type,
      imageUrl: log.imageUrl,
      timestamp: log.timestamp,
      aiAnalysis: log.aiAnalysis,
    }))

    return NextResponse.json({ logs: transformedLogs })
  } catch (error) {
    console.error("Fetch logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
