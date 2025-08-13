"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Utensils, BarChart3, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      title: "Log Workout",
      description: "Capture your exercise session",
      icon: Camera,
      gradient: "from-blue-500 to-cyan-500",
      onClick: () => router.push("/upload?type=workout"),
    },
    {
      title: "Log Meal",
      description: "Track your nutrition",
      icon: Utensils,
      gradient: "from-green-500 to-emerald-500",
      onClick: () => router.push("/upload?type=diet"),
    },
    {
      title: "View Analytics",
      description: "Check your progress",
      icon: BarChart3,
      gradient: "from-purple-500 to-pink-500",
      onClick: () => router.push("/analytics"),
    },
    {
      title: "Settings",
      description: "Customize your experience",
      icon: Settings,
      gradient: "from-orange-500 to-red-500",
      onClick: () => router.push("/settings"),
    },
  ]

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                onClick={action.onClick}
              >
                <div className={`bg-gradient-to-r ${action.gradient} p-3 rounded-xl shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-800">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
