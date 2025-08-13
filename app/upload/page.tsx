"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ImageCapture } from "@/components/upload/image-capture"
import { UploadForm, type UploadFormData } from "@/components/upload/upload-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera, Utensils } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null)
  const [capturedImage, setCapturedImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadType, setUploadType] = useState<"workout" | "diet">("workout")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    // Get type from URL params
    const typeParam = searchParams.get("type")
    if (typeParam === "diet" || typeParam === "workout") {
      setUploadType(typeParam)
    }

    // Fetch user data
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
  }, [router, searchParams])

  const handleImageCapture = (file: File) => {
    setCapturedImage(file)
  }

  const handleImageRemove = () => {
    setCapturedImage(null)
  }

  const handleFormSubmit = async (formData: UploadFormData) => {
    if (!capturedImage || !user) return

    setIsSubmitting(true)
    try {
      // Create FormData for file upload
      const uploadData = new FormData()
      uploadData.append("image", capturedImage)
      uploadData.append("type", uploadType)
      uploadData.append("title", formData.title)
      uploadData.append("description", formData.description)
      uploadData.append("tags", JSON.stringify(formData.tags))
      uploadData.append("userEmail", user.email)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success!",
          description: `Your ${uploadType} has been logged successfully.`,
        })
        router.push("/dashboard")
      } else {
        const error = await response.json()
        throw new Error(error.message || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="hover:bg-white/60 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Log Your {uploadType === "workout" ? "Workout" : "Meal"}
              </h1>
              <p className="text-gray-600">
                {uploadType === "workout"
                  ? "Capture your exercise session and track your progress"
                  : "Document your nutrition and maintain healthy eating habits"}
              </p>
            </div>
          </div>

          {/* Type Selector */}
          <div className="flex space-x-2">
            <Button
              variant={uploadType === "workout" ? "default" : "outline"}
              size="sm"
              onClick={() => setUploadType("workout")}
              className={
                uploadType === "workout"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : "border-orange-300 text-orange-600 hover:bg-orange-50"
              }
            >
              <Camera className="h-4 w-4 mr-2" />
              Workout
            </Button>
            <Button
              variant={uploadType === "diet" ? "default" : "outline"}
              size="sm"
              onClick={() => setUploadType("diet")}
              className={
                uploadType === "diet"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "border-green-300 text-green-600 hover:bg-green-50"
              }
            >
              <Utensils className="h-4 w-4 mr-2" />
              Meal
            </Button>
          </div>
        </div>

        {/* Upload Type Badge */}
        <div className="flex justify-center">
          <Badge
            className={`${
              uploadType === "workout"
                ? "bg-gradient-to-r from-orange-500 to-red-500"
                : "bg-gradient-to-r from-green-500 to-emerald-500"
            } text-white border-0 shadow-lg px-4 py-2 text-sm font-semibold`}
          >
            {uploadType === "workout" ? "🏋️ Workout Session" : "🍽️ Nutrition Log"}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Capture */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">Step 1: Capture Image</CardTitle>
              </CardHeader>
            </Card>
            <ImageCapture
              onImageCapture={handleImageCapture}
              onImageRemove={handleImageRemove}
              capturedImage={capturedImage}
              type={uploadType}
            />
          </div>

          {/* Upload Form */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">Step 2: Add Details</CardTitle>
              </CardHeader>
            </Card>
            <UploadForm
              type={uploadType}
              image={capturedImage}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Tips Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {uploadType === "workout" ? "Workout Logging Tips" : "Meal Logging Tips"}
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              {uploadType === "workout" ? (
                <>
                  <div>• Include equipment or exercise setup in the photo</div>
                  <div>• Add details about sets, reps, and weights used</div>
                  <div>• Tag the muscle groups or exercise type</div>
                  <div>• Note the duration and intensity level</div>
                </>
              ) : (
                <>
                  <div>• Capture the full meal or individual components</div>
                  <div>• Include portion sizes and ingredients</div>
                  <div>• Tag meal type and dietary preferences</div>
                  <div>• Note preparation method and cooking time</div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
