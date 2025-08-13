"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ComposedChart, Line, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { TrendingUp } from "lucide-react"

interface ProgressChartProps {
  data: Array<{
    date: string
    workouts: number
    meals: number
    total: number
  }>
  streakData: Array<{
    date: string
    streak: number
  }>
}

export function ProgressChart({ data, streakData }: ProgressChartProps) {
  // Combine data for progress visualization
  const combinedData = data.map((item, index) => ({
    ...item,
    streak: streakData[index]?.streak || 0,
    cumulativeTotal: data.slice(0, index + 1).reduce((sum, d) => sum + d.total, 0),
  }))

  const chartConfig = {
    total: {
      label: "Daily Total",
      color: "hsl(var(--chart-1))",
    },
    cumulativeTotal: {
      label: "Cumulative Total",
      color: "hsl(var(--chart-2))",
    },
    streak: {
      label: "Streak",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <span>Progress Overview</span>
        </CardTitle>
        <CardDescription>Your fitness journey progression</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={combinedData}>
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />

              <Bar yAxisId="left" dataKey="total" fill="var(--color-total)" opacity={0.6} radius={[2, 2, 0, 0]} />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulativeTotal"
                stroke="var(--color-cumulativeTotal)"
                strokeWidth={3}
                dot={{ fill: "var(--color-cumulativeTotal)", strokeWidth: 2, r: 4 }}
              />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="streak"
                stroke="var(--color-streak)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "var(--color-streak)", strokeWidth: 2, r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {combinedData[combinedData.length - 1]?.cumulativeTotal || 0}
            </div>
            <div className="text-xs text-gray-600">Total Activities</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {Math.round((combinedData.reduce((sum, d) => sum + d.total, 0) / combinedData.length) * 10) / 10}
            </div>
            <div className="text-xs text-gray-600">Daily Average</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{Math.max(...combinedData.map((d) => d.streak))}</div>
            <div className="text-xs text-gray-600">Peak Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
