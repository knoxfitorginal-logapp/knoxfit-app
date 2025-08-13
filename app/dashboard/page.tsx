"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/ui/stat-card"
import { StreakDisplay } from "@/components/dashboard/streak-display"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { AIInsights } from "@/components/dashboard/ai-insights"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { WorkoutCard } from "@/components/workout/workout-card"
import { Camera, Dumbbell, Utensils, TrendingUp, Calendar } from "lucide-react"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  stats: {
    totalUploads: number
    currentStreak: number
    longestStreak: number
  }
  consistencyStreak: number
}

interface WorkoutLog {
  id: string
  type: "workout" | "diet"
  imageUrl: string
  timestamp: Date
  aiAnalysis?: {
    detectedActivity?: string
    confidence?: number
    suggestions?: string[]
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [recentLogs, setRecentLogs] = useState<WorkoutLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  useEffect(() => {
    const fetchRecentLogs = async () => {
      try {
        const response = await fetch("/api/logs?limit=6")
        if (response.ok) {
          const data = await response.json()
          setRecentLogs(
            data.logs.map((log: any) => ({
              ...log,
              timestamp: new Date(log.timestamp),
            })),
          )
        }
      } catch (error) {
        console.error("Failed to fetch recent logs:", error)
      }
    }

    if (user) {
      fetchRecentLogs()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Calculate streak progress (mock data for now)
  const streakProgress = (user.consistencyStreak / 30) * 100

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 text-lg">Ready to crush your fitness goals today?</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Logs"
            value={user.stats.totalUploads}
            description="Workouts & meals tracked"
            icon={Dumbbell}
            gradient="from-blue-500 to-cyan-500"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Current Streak"
            value={`${user.stats.currentStreak} days`}
            description="Keep it going!"
            icon={TrendingUp}
            gradient="from-orange-500 to-red-500"
          />
          <StatCard
            title="This Week"
            value={
              recentLogs.filter((log) => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return log.timestamp > weekAgo
              }).length
            }
            description="Recent activities"
            icon={Calendar}
            gradient="from-green-500 to-emerald-500"
            trend={{ value: 25, isPositive: true }}
          />
          <StatCard
            title="Best Streak"
            value={`${user.stats.longestStreak} days`}
            description="Personal record"
            icon={Utensils}
            gradient="from-purple-500 to-pink-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Streak Display */}
          <div className="lg:col-span-1 space-y-6">
            <StreakDisplay
              currentStreak={user.stats.currentStreak}
              longestStreak={user.stats.longestStreak}
              totalUploads={user.stats.totalUploads}
              streakProgress={streakProgress}
            />
            {/* Added AI Insights component */}
            <AIInsights userId={user.id} />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
          {recentLogs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentLogs.map((log) => (
                <WorkoutCard
                  key={log.id}
                  id={log.id}
                  type={log.type}
                  imageUrl={log.imageUrl}
                  timestamp={log.timestamp}
                  aiAnalysis={log.aiAnalysis}
                  onView={(id) => router.push(`/logs/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/60 rounded-2xl backdrop-blur-sm">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No logs yet</h3>
              <p className="text-gray-500 mb-6">Start your fitness journey by logging your first workout!</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton icon={Camera} onClick={() => router.push("/upload")} />
    </DashboardLayout>
  )
}
