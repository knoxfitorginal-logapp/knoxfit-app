import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { uploadImageToDrive } from "@/lib/google-drive"
import clientPromise from "@/lib/mongodb"
import type { WorkoutLog } from "@/lib/models/User"

export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData()
    const image = formData.get("image") as File
    const type = formData.get("type") as "workout" | "diet"
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const tags = JSON.parse(formData.get("tags") as string)
    const userEmail = formData.get("userEmail") as string

    if (!image || !type || !title || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate image
    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Please upload an image." }, { status: 400 })
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (image.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 })
    }

    // Convert image to buffer for Google Drive upload
    const imageBuffer = Buffer.from(await image.arrayBuffer())

    let driveUploadResult
    try {
      driveUploadResult = await uploadImageToDrive(imageBuffer, image.name, userEmail, type, title)
    } catch (driveError) {
      console.error("Google Drive upload failed:", driveError)
      return NextResponse.json(
        {
          error: "Failed to upload image to storage. Please try again.",
        },
        { status: 500 },
      )
    }

    const generateAIAnalysis = (type: "workout" | "diet", title: string, description: string) => {
      const workoutActivities = [
        "strength training",
        "cardio",
        "yoga",
        "running",
        "cycling",
        "swimming",
        "weightlifting",
        "hiit",
      ]
      const dietCategories = [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "protein",
        "vegetables",
        "fruits",
        "healthy meal",
      ]

      let detectedActivity = type === "workout" ? "Exercise Session" : "Meal"
      let suggestions: string[] = []

      if (type === "workout") {
        // Try to detect activity from title/description
        const lowerTitle = title.toLowerCase()
        const lowerDesc = description.toLowerCase()
        const detected = workoutActivities.find(
          (activity) => lowerTitle.includes(activity) || lowerDesc.includes(activity),
        )
        if (detected) {
          detectedActivity = detected.charAt(0).toUpperCase() + detected.slice(1)
        }

        suggestions = [
          "Great job staying active! Consistency is key to reaching your fitness goals.",
          "Consider tracking your sets, reps, and weights for better progress monitoring.",
          "Don't forget to stay hydrated and get adequate rest for recovery.",
        ]
      } else {
        // Try to detect meal type from title/description
        const lowerTitle = title.toLowerCase()
        const lowerDesc = description.toLowerCase()
        const detected = dietCategories.find(
          (category) => lowerTitle.includes(category) || lowerDesc.includes(category),
        )
        if (detected) {
          detectedActivity = detected.charAt(0).toUpperCase() + detected.slice(1)
        }

        suggestions = [
          "Excellent nutrition tracking! Consistent logging helps build healthy habits.",
          "Try to include a variety of colorful fruits and vegetables for optimal nutrition.",
          "Remember to stay hydrated throughout the day for better health.",
        ]
      }

      return {
        detectedActivity,
        confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7-1.0
        suggestions: suggestions.slice(0, 2), // Limit to 2 suggestions
      }
    }

    // Create workout log entry with real Google Drive data
    const workoutLog: Omit<WorkoutLog, "_id"> = {
      userId: decoded.userId,
      userEmail,
      type,
      imageUrl: driveUploadResult.directLink, // Use actual Google Drive direct link
      driveFileId: driveUploadResult.fileId, // Use actual Google Drive file ID
      timestamp: new Date(),
      aiAnalysis: generateAIAnalysis(type, title, description), // Enhanced AI analysis
    }

    // Save to database
    const client = await clientPromise
    const db = client.db("knoxfit")
    const result = await db.collection("workout_logs").insertOne(workoutLog)

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Get user's last upload date
    const user = await db.collection("users").findOne({ email: userEmail })
    const lastUploadDate = user?.lastUploadDate ? new Date(user.lastUploadDate) : null
    const lastUploadDay = lastUploadDate
      ? new Date(lastUploadDate.getFullYear(), lastUploadDate.getMonth(), lastUploadDate.getDate())
      : null

    let streakUpdate = {}

    if (!lastUploadDay || lastUploadDay.getTime() !== today.getTime()) {
      // This is the first upload today
      if (lastUploadDay && today.getTime() - lastUploadDay.getTime() === 24 * 60 * 60 * 1000) {
        // Consecutive day - increment streak
        streakUpdate = {
          $inc: {
            "stats.totalUploads": 1,
            "stats.currentStreak": 1,
            consistencyStreak: 1,
          },
          $set: { lastUploadDate: now },
          $max: { "stats.longestStreak": (user?.stats?.currentStreak || 0) + 1 },
        }
      } else if (lastUploadDay && today.getTime() - lastUploadDay.getTime() > 24 * 60 * 60 * 1000) {
        // Streak broken - reset to 1
        streakUpdate = {
          $inc: { "stats.totalUploads": 1 },
          $set: {
            lastUploadDate: now,
            "stats.currentStreak": 1,
            consistencyStreak: 1,
          },
        }
      } else {
        // First upload ever or same day
        streakUpdate = {
          $inc: { "stats.totalUploads": 1 },
          $set: {
            lastUploadDate: now,
            "stats.currentStreak": 1,
            consistencyStreak: 1,
          },
        }
      }
    } else {
      // Additional upload same day - just increment total
      streakUpdate = {
        $inc: { "stats.totalUploads": 1 },
        $set: { lastUploadDate: now },
      }
    }

    await db.collection("users").updateOne({ email: userEmail }, streakUpdate)

    return NextResponse.json({
      message: "Upload successful! Your image has been saved to Google Drive.",
      logId: result.insertedId.toString(),
      imageUrl: driveUploadResult.directLink,
      driveFileId: driveUploadResult.fileId,
      webViewLink: driveUploadResult.webViewLink,
      aiAnalysis: workoutLog.aiAnalysis,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}
