"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { TrendingUp } from "lucide-react"

interface ActivityChartProps {
  data: Array<{
    date: string
    workouts: number
    meals: number
    total: number
  }>
  detailed?: boolean
}

export function ActivityChart({ data, detailed = false }: ActivityChartProps) {
  const chartConfig = {
    workouts: {
      label: "Workouts",
      color: "hsl(var(--chart-1))",
    },
    meals: {
      label: "Meals",
      color: "hsl(var(--chart-2))",
    },
    total: {
      label: "Total",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <span>Activity Trends</span>
        </CardTitle>
        <CardDescription>
          {detailed ? "Detailed activity breakdown over time" : "Your daily activity patterns"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            {detailed ? (
              <BarChart data={data}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="workouts" fill="var(--color-workouts)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="meals" fill="var(--color-meals)" radius={[2, 2, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-total)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-total)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
