"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, RefreshCw, Lightbulb } from "lucide-react"
import { ProgressRing } from "@/components/ui/progress-ring"

interface AIInsightsProps {
  userId: string
}

export function AIInsights({ userId }: AIInsightsProps) {
  const [insights, setInsights] = useState<string[]>([])
  const [consistencyScore, setConsistencyScore] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchInsights = async () => {
    try {
      const response = await fetch("/api/insights")
      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights)
        setConsistencyScore(data.consistencyScore)
      }
    } catch (error) {
      console.error("Failed to fetch insights:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [userId])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchInsights()
  }

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const getConsistencyLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Work"
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-800">
          <Brain className="h-6 w-6 text-purple-600" />
          <span>AI Insights</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="hover:bg-white/60 backdrop-blur-sm"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Consistency Score */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-2">Consistency Score</h3>
            <div className="flex items-center space-x-3">
              <ProgressRing progress={consistencyScore} size={60} strokeWidth={6}>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getConsistencyColor(consistencyScore)}`}>{consistencyScore}</div>
                </div>
              </ProgressRing>
              <div>
                <Badge
                  className={`${
                    consistencyScore >= 80
                      ? "bg-green-100 text-green-800"
                      : consistencyScore >= 60
                        ? "bg-yellow-100 text-yellow-800"
                        : consistencyScore >= 40
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                  } border-0`}
                >
                  {getConsistencyLabel(consistencyScore)}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">Based on 30-day activity</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
            Personalized Insights
          </h3>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-3 bg-white/60 rounded-lg backdrop-blur-sm border border-white/20 text-sm text-gray-700"
                >
                  {insight}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Start logging activities to get personalized insights!</p>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-white/20">
          AI insights update automatically based on your activity patterns
        </div>
      </CardContent>
    </Card>
  )
}
