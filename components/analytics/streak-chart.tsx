"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StreakChartProps {
  data: Array<{
    date: string
    streak: number
  }>
  currentStreak: number
  longestStreak: number
}

export function StreakChart({ data, currentStreak, longestStreak }: StreakChartProps) {
  const chartConfig = {
    streak: {
      label: "Streak",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span>Streak Analysis</span>
          </div>
          <div className="flex space-x-2">
            <Badge className="bg-orange-500 text-white">Current: {currentStreak}d</Badge>
            <Badge variant="outline" className="border-orange-300 text-orange-600">
              Best: {longestStreak}d
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>Your consistency journey over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="streakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="streak" stroke="#f97316" fillOpacity={1} fill="url(#streakGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/60 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{currentStreak}</div>
            <div className="text-xs text-gray-600">Current Streak</div>
          </div>
          <div className="p-3 bg-white/60 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{longestStreak}</div>
            <div className="text-xs text-gray-600">Longest Streak</div>
          </div>
          <div className="p-3 bg-white/60 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{data.filter((d) => d.streak > 0).length}</div>
            <div className="text-xs text-gray-600">Active Days</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
