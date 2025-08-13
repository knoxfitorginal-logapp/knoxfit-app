import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("knoxfit")
    const user = await db.collection("users").findOne({ email: decoded.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      notificationSettings: user.notificationSettings || {
        motivationalReminders: true,
        consistencyAlerts: true,
      },
    })
  } catch (error) {
    console.error("Get notification settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { motivationalReminders, consistencyAlerts } = await request.json()

    const client = await clientPromise
    const db = client.db("knoxfit")

    await db.collection("users").updateOne(
      { email: decoded.email },
      {
        $set: {
          notificationSettings: {
            motivationalReminders: Boolean(motivationalReminders),
            consistencyAlerts: Boolean(consistencyAlerts),
          },
        },
      },
    )

    return NextResponse.json({
      message: "Notification settings updated successfully",
      notificationSettings: {
        motivationalReminders: Boolean(motivationalReminders),
        consistencyAlerts: Boolean(consistencyAlerts),
      },
    })
  } catch (error) {
    console.error("Update notification settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
