import { NextResponse } from "next/server"
import { checkMissedLogs, checkAndResetCycles } from "@/lib/ai-tracking"

export async function POST() {
  try {
    // This endpoint will be called by a cron job or scheduled task
    console.log("Running notification checks...")

    // Check for missed logs and send motivational emails
    await checkMissedLogs()

    // Check and reset 30-day cycles
    await checkAndResetCycles()

    return NextResponse.json({
      message: "Notification checks completed successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Notification check failed:", error)
    return NextResponse.json(
      {
        error: "Failed to run notification checks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Allow GET for testing purposes
export async function GET() {
  return POST()
}
