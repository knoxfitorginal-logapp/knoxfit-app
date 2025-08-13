"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Dumbbell, Utensils } from "lucide-react"

interface ActivityBreakdownProps {
  workouts: number
  meals: number
  categoryData?: {
    workouts: { [key: string]: number }
    meals: { [key: string]: number }
  }
  detailed?: boolean
}

export function ActivityBreakdown({ workouts, meals, categoryData, detailed = false }: ActivityBreakdownProps) {
  const data = [
    { name: "Workouts", value: workouts, color: "#3b82f6" },
    { name: "Meals", value: meals, color: "#10b981" },
  ]

  const total = workouts + meals

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <Dumbbell className="h-4 w-4 text-blue-500" />
            <Utensils className="h-4 w-4 text-green-500" />
          </div>
          <span>Activity Breakdown</span>
        </CardTitle>
        <CardDescription>{detailed ? "Detailed category analysis" : "Distribution of your activities"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <ChartContainer
            config={{
              workouts: { label: "Workouts", color: "#3b82f6" },
              meals: { label: "Meals", color: "#10b981" },
            }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Workouts</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{workouts}</div>
              <div className="text-xs text-gray-500">{total > 0 ? Math.round((workouts / total) * 100) : 0}%</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Meals</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{meals}</div>
              <div className="text-xs text-gray-500">{total > 0 ? Math.round((meals / total) * 100) : 0}%</div>
            </div>
          </div>
        </div>

        {detailed && categoryData && (
          <div className="mt-6 pt-6 border-t space-y-4">
            <h4 className="font-medium text-sm">Top Categories</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium text-blue-600 mb-2">Workout Types</p>
                {Object.entries(categoryData.workouts)
                  .slice(0, 3)
                  .map(([category, count]) => (
                    <div key={category} className="flex justify-between">
                      <span className="capitalize">{category}</span>
                      <span>{count}</span>
                    </div>
                  ))}
              </div>
              <div>
                <p className="font-medium text-green-600 mb-2">Meal Types</p>
                {Object.entries(categoryData.meals)
                  .slice(0, 3)
                  .map(([category, count]) => (
                    <div key={category} className="flex justify-between">
                      <span className="capitalize">{category}</span>
                      <span>{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
