import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { calculateConsistencyScore } from "@/lib/ai-tracking"

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
    const timeframe = searchParams.get("timeframe") || "30d"
    const fromDate = searchParams.get("from")
    const toDate = searchParams.get("to")

    // Calculate date range
    let startDate: Date
    let endDate = new Date()

    if (fromDate && toDate) {
      startDate = new Date(fromDate)
      endDate = new Date(toDate)
    } else {
      const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : timeframe === "90d" ? 90 : 365
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
    }

    const client = await clientPromise
    const db = client.db("knoxfit")

    // Fetch user's logs within date range
    const logs = await db
      .collection("workout_logs")
      .find({
        userId: decoded.userId,
        timestamp: { $gte: startDate, $lte: endDate },
      })
      .sort({ timestamp: 1 })
      .toArray()

    // Process data for analytics
    const activityData = processActivityData(logs, startDate, endDate)
    const streakData = processStreakData(logs, startDate, endDate)
    const categoryBreakdown = processCategoryBreakdown(logs)

    const totalWorkouts = logs.filter((log) => log.type === "workout").length
    const totalMeals = logs.filter((log) => log.type === "diet").length
    const totalActivities = totalWorkouts + totalMeals

    // Calculate weekly average
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const weeklyAverage = (totalActivities / daysDiff) * 7

    // Calculate monthly growth (mock calculation)
    const monthlyGrowth = Math.round(Math.random() * 20 + 5) // Mock data

    // Get consistency score
    const consistencyScore = await calculateConsistencyScore(decoded.userId)

    return NextResponse.json({
      totalWorkouts,
      totalMeals,
      weeklyAverage,
      monthlyGrowth,
      consistencyScore,
      activityData,
      streakData,
      categoryBreakdown,
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function processActivityData(logs: any[], startDate: Date, endDate: Date) {
  const data = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0]
    const dayLogs = logs.filter((log) => log.timestamp.toISOString().split("T")[0] === dateStr)

    const workouts = dayLogs.filter((log) => log.type === "workout").length
    const meals = dayLogs.filter((log) => log.type === "diet").length

    data.push({
      date: dateStr,
      workouts,
      meals,
      total: workouts + meals,
    })

    current.setDate(current.getDate() + 1)
  }

  return data
}

function processStreakData(logs: any[], startDate: Date, endDate: Date) {
  const data = []
  const current = new Date(startDate)
  let currentStreak = 0

  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0]
    const dayLogs = logs.filter((log) => log.timestamp.toISOString().split("T")[0] === dateStr)

    if (dayLogs.length > 0) {
      currentStreak++
    } else {
      currentStreak = 0
    }

    data.push({
      date: dateStr,
      streak: currentStreak,
    })

    current.setDate(current.getDate() + 1)
  }

  return data
}

function processCategoryBreakdown(logs: any[]) {
  const workouts: { [key: string]: number } = {}
  const meals: { [key: string]: number } = {}

  logs.forEach((log) => {
    const activity = log.aiAnalysis?.detectedActivity || "Other"

    if (log.type === "workout") {
      workouts[activity] = (workouts[activity] || 0) + 1
    } else {
      meals[activity] = (meals[activity] || 0) + 1
    }
  })

  return { workouts, meals }
}
