"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDateRangePicker } from "@/components/analytics/date-range-picker"
import { ActivityChart } from "@/components/analytics/activity-chart"
import { StreakChart } from "@/components/analytics/streak-chart"
import { ProgressChart } from "@/components/analytics/progress-chart"
import { ActivityBreakdown } from "@/components/analytics/activity-breakdown"
import { GoalTracker } from "@/components/analytics/goal-tracker"
import { ExportData } from "@/components/analytics/export-data"
import { StatCard } from "@/components/ui/stat-card"
import { BarChart3, Target, Dumbbell, Utensils, Trophy } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { subDays } from "date-fns"

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
}

interface AnalyticsData {
  totalWorkouts: number
  totalMeals: number
  weeklyAverage: number
  monthlyGrowth: number
  consistencyScore: number
  activityData: Array<{
    date: string
    workouts: number
    meals: number
    total: number
  }>
  streakData: Array<{
    date: string
    streak: number
  }>
  categoryBreakdown: {
    workouts: { [key: string]: number }
    meals: { [key: string]: number }
  }
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "1y">("30d")
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
      }
    }

    fetchUserData()
  }, [router])

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return

      try {
        const params = new URLSearchParams({
          timeframe,
          ...(dateRange?.from && { from: dateRange.from.toISOString() }),
          ...(dateRange?.to && { to: dateRange.to.toISOString() }),
        })

        const response = await fetch(`/api/analytics?${params}`)
        if (response.ok) {
          const data = await response.json()
          setAnalyticsData(data)
        }
      } catch (error) {
        console.error("Failed to fetch analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [user, timeframe, dateRange])

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value as "7d" | "30d" | "90d" | "1y")

    // Update date range based on timeframe
    const now = new Date()
    let from: Date

    switch (value) {
      case "7d":
        from = subDays(now, 7)
        break
      case "30d":
        from = subDays(now, 30)
        break
      case "90d":
        from = subDays(now, 90)
        break
      case "1y":
        from = subDays(now, 365)
        break
      default:
        from = subDays(now, 30)
    }

    setDateRange({ from, to: now })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !analyticsData) {
    return null
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Track your progress and insights</p>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={timeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <CalendarDateRangePicker date={dateRange} onDateChange={setDateRange} />

            <ExportData data={analyticsData} dateRange={dateRange} userEmail={user.email} />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Workouts"
            value={analyticsData.totalWorkouts}
            description={`${timeframe} period`}
            icon={Dumbbell}
            gradient="from-blue-500 to-cyan-500"
            trend={{ value: analyticsData.monthlyGrowth, isPositive: analyticsData.monthlyGrowth > 0 }}
          />
          <StatCard
            title="Total Meals"
            value={analyticsData.totalMeals}
            description={`${timeframe} period`}
            icon={Utensils}
            gradient="from-green-500 to-emerald-500"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Weekly Average"
            value={`${analyticsData.weeklyAverage.toFixed(1)}`}
            description="Activities per week"
            icon={BarChart3}
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            title="Consistency Score"
            value={`${analyticsData.consistencyScore}%`}
            description="Based on daily activity"
            icon={Target}
            gradient="from-orange-500 to-red-500"
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Main Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ActivityChart data={analyticsData.activityData} />
              <ActivityBreakdown
                workouts={analyticsData.totalWorkouts}
                meals={analyticsData.totalMeals}
                categoryData={analyticsData.categoryBreakdown}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <StreakChart
                data={analyticsData.streakData}
                currentStreak={user.stats.currentStreak}
                longestStreak={user.stats.longestStreak}
              />

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span>Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {user.stats.currentStreak >= 7 && (
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <Badge className="bg-yellow-500 text-white">🔥</Badge>
                        <div>
                          <p className="font-medium">Week Warrior</p>
                          <p className="text-sm text-gray-600">7+ day streak achieved!</p>
                        </div>
                      </div>
                    )}

                    {analyticsData.totalWorkouts >= 10 && (
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Badge className="bg-blue-500 text-white">💪</Badge>
                        <div>
                          <p className="font-medium">Fitness Enthusiast</p>
                          <p className="text-sm text-gray-600">10+ workouts logged!</p>
                        </div>
                      </div>
                    )}

                    {analyticsData.consistencyScore >= 80 && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <Badge className="bg-green-500 text-white">⭐</Badge>
                        <div>
                          <p className="font-medium">Consistency Champion</p>
                          <p className="text-sm text-gray-600">80%+ consistency rate!</p>
                        </div>
                      </div>
                    )}

                    {analyticsData.totalWorkouts + analyticsData.totalMeals === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Start logging activities to unlock achievements!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <ActivityChart data={analyticsData.activityData} detailed />
            <div className="grid lg:grid-cols-2 gap-6">
              <ActivityBreakdown
                workouts={analyticsData.totalWorkouts}
                meals={analyticsData.totalMeals}
                categoryData={analyticsData.categoryBreakdown}
                detailed
              />

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Activity Patterns</CardTitle>
                  <CardDescription>When you're most active</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Most active day</span>
                      <Badge variant="outline">Monday</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Preferred time</span>
                      <Badge variant="outline">Morning</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average session</span>
                      <Badge variant="outline">1.2 activities</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <ProgressChart data={analyticsData.activityData} streakData={analyticsData.streakData} />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <GoalTracker
              currentStats={{
                workouts: analyticsData.totalWorkouts,
                meals: analyticsData.totalMeals,
                streak: user.stats.currentStreak,
                consistency: analyticsData.consistencyScore,
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
