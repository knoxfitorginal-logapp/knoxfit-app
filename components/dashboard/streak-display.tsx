"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Target, Trophy } from "lucide-react"
import { ProgressRing } from "@/components/ui/progress-ring"
import { AnimatedCounter } from "@/components/ui/animated-counter"

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  totalUploads: number
  streakProgress: number // 0-100 for 30-day cycle
}

export function StreakDisplay({ currentStreak, longestStreak, totalUploads, streakProgress }: StreakDisplayProps) {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center space-x-2 text-xl font-bold text-gray-800">
          <Flame className="h-6 w-6 text-orange-500" />
          <span>Consistency Streak</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Streak Display */}
        <div className="flex justify-center">
          <ProgressRing progress={streakProgress} size={140} strokeWidth={10}>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                <AnimatedCounter value={currentStreak} />
              </div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
          </ProgressRing>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white/60 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              <AnimatedCounter value={longestStreak} />
            </div>
            <div className="text-sm text-gray-600">Best Streak</div>
          </div>

          <div className="text-center p-4 bg-white/60 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              <AnimatedCounter value={totalUploads} />
            </div>
            <div className="text-sm text-gray-600">Total Logs</div>
          </div>
        </div>

        {/* Streak Status */}
        <div className="text-center">
          {currentStreak >= 7 && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-md">
              {currentStreak >= 30 ? "Legendary Streak!" : currentStreak >= 14 ? "Amazing Streak!" : "Great Streak!"}
            </Badge>
          )}
          {currentStreak < 7 && currentStreak > 0 && (
            <Badge variant="outline" className="border-orange-300 text-orange-600">
              Building Momentum
            </Badge>
          )}
          {currentStreak === 0 && (
            <Badge variant="outline" className="border-gray-300 text-gray-600">
              Start Your Streak Today!
            </Badge>
          )}
        </div>

        {/* Progress Text */}
        <div className="text-center text-sm text-gray-600">
          <p>{30 - (streakProgress / 100) * 30} days until streak cycle resets</p>
        </div>
      </CardContent>
    </Card>
  )
}
