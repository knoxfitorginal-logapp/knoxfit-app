"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Eye } from "lucide-react"

interface WorkoutCardProps {
  id: string
  type: "workout" | "diet"
  imageUrl: string
  timestamp: Date
  aiAnalysis?: {
    detectedActivity?: string
    confidence?: number
    suggestions?: string[]
  }
  onView?: (id: string) => void
}

export function WorkoutCard({ id, type, imageUrl, timestamp, aiAnalysis, onView }: WorkoutCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <img
          src={imageUrl || "/placeholder.svg?height=200&width=300&query=fitness"}
          alt={`${type} log`}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge
            variant={type === "workout" ? "default" : "secondary"}
            className={`${
              type === "workout"
                ? "bg-gradient-to-r from-orange-500 to-red-500"
                : "bg-gradient-to-r from-green-500 to-emerald-500"
            } text-white border-0 shadow-md`}
          >
            {type === "workout" ? "Workout" : "Diet"}
          </Badge>
        </div>
        {aiAnalysis?.confidence && (
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              {Math.round(aiAnalysis.confidence * 100)}% AI
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(timestamp)}</span>
          </div>
          {onView && (
            <Button variant="ghost" size="sm" onClick={() => onView(id)} className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {aiAnalysis?.detectedActivity && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">AI Detected: {aiAnalysis.detectedActivity}</p>
            {aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Suggestions:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {aiAnalysis.suggestions.slice(0, 2).map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
