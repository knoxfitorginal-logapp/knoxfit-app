import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { deleteFileFromDrive, getFileInfo } from "@/lib/google-drive"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid log ID" }, { status: 400 })
    }

    // Fetch log from database
    const client = await clientPromise
    const db = client.db("knoxfit")
    const log = await db.collection("workout_logs").findOne({
      _id: new ObjectId(id),
      userId: decoded.userId, // Ensure user can only access their own logs
    })

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 })
    }

    // Get additional file info from Google Drive
    let fileInfo = null
    try {
      if (log.driveFileId && log.driveFileId !== "placeholder") {
        fileInfo = await getFileInfo(log.driveFileId)
      }
    } catch (error) {
      console.warn("Could not fetch file info from Google Drive:", error)
    }

    // Transform log for response
    const transformedLog = {
      id: log._id.toString(),
      type: log.type,
      imageUrl: log.imageUrl,
      driveFileId: log.driveFileId,
      timestamp: log.timestamp,
      aiAnalysis: log.aiAnalysis,
      fileInfo,
    }

    return NextResponse.json({ log: transformedLog })
  } catch (error) {
    console.error("Fetch log error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid log ID" }, { status: 400 })
    }

    // Fetch log from database
    const client = await clientPromise
    const db = client.db("knoxfit")
    const log = await db.collection("workout_logs").findOne({
      _id: new ObjectId(id),
      userId: decoded.userId, // Ensure user can only delete their own logs
    })

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 })
    }

    // Delete from Google Drive if file exists
    if (log.driveFileId && log.driveFileId !== "placeholder") {
      try {
        await deleteFileFromDrive(log.driveFileId)
      } catch (error) {
        console.warn("Could not delete file from Google Drive:", error)
        // Continue with database deletion even if Drive deletion fails
      }
    }

    // Delete from database
    await db.collection("workout_logs").deleteOne({ _id: new ObjectId(id) })

    // Update user stats
    await db.collection("users").updateOne({ email: log.userEmail }, { $inc: { "stats.totalUploads": -1 } })

    return NextResponse.json({ message: "Log deleted successfully" })
  } catch (error) {
    console.error("Delete log error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
