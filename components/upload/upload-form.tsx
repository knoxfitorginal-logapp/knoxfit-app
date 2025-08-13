"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send } from "lucide-react"

interface UploadFormProps {
  type: "workout" | "diet"
  image: File | null
  onSubmit: (data: UploadFormData) => Promise<void>
  isSubmitting: boolean
}

export interface UploadFormData {
  title: string
  description: string
  tags: string[]
  type: "workout" | "diet"
}

export function UploadForm({ type, image, onSubmit, isSubmitting }: UploadFormProps) {
  const [formData, setFormData] = useState<UploadFormData>({
    title: "",
    description: "",
    tags: [],
    type,
  })
  const [tagInput, setTagInput] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image) return
    await onSubmit(formData)
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }))
    }
    setTagInput("")
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  const suggestedTags =
    type === "workout"
      ? ["strength", "cardio", "flexibility", "endurance", "hiit", "yoga", "running", "weightlifting"]
      : ["breakfast", "lunch", "dinner", "snack", "healthy", "protein", "vegetables", "fruits"]

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">
          {type === "workout" ? "Workout Details" : "Meal Details"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700 font-medium">
              Title
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder={type === "workout" ? "e.g., Morning Gym Session" : "e.g., Healthy Breakfast Bowl"}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder={
                type === "workout"
                  ? "Describe your workout routine, exercises, duration, etc."
                  : "Describe your meal, ingredients, preparation method, etc."
              }
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg min-h-[100px]"
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-gray-700 font-medium">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyPress}
              placeholder="Add tags (press Enter or comma to add)"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Suggestions:</span>
              {suggestedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 text-xs"
                  onClick={() => addTag(tag)}
                >
                  + {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!image || isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:shadow-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Uploading...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Send className="h-5 w-5 mr-2" />
                Log {type === "workout" ? "Workout" : "Meal"}
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
