"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, X, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageCaptureProps {
  onImageCapture: (file: File) => void
  onImageRemove: () => void
  capturedImage: File | null
  type: "workout" | "diet"
}

export function ImageCapture({ onImageCapture, onImageRemove, capturedImage, type }: ImageCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
        audio: false,
      })
      setStream(mediaStream)
      setIsCapturing(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }, [toast])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `${type}-${Date.now()}.jpg`, {
                type: "image/jpeg",
              })
              onImageCapture(file)
              setPreviewUrl(URL.createObjectURL(blob))
              stopCamera()
            }
          },
          "image/jpeg",
          0.8,
        )
      }
    }
  }, [type, onImageCapture, stopCamera])

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file && file.type.startsWith("image/")) {
        onImageCapture(file)
        setPreviewUrl(URL.createObjectURL(file))
      }
    },
    [onImageCapture],
  )

  const handleRemoveImage = useCallback(() => {
    onImageRemove()
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onImageRemove])

  // Show captured image preview
  if (capturedImage && previewUrl) {
    return (
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden">
              <img src={previewUrl || "/placeholder.svg"} alt="Captured image" className="w-full h-64 object-cover" />
              <div className="absolute top-3 right-3 flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-sm hover:bg-white"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="font-medium">Image captured successfully!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show camera view
  if (isCapturing) {
    return (
      <Card className="border-0 shadow-xl bg-black">
        <CardContent className="p-0">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover rounded-t-lg"
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.play()
                }
              }}
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 rounded-full h-16 w-16 p-0"
                onClick={capturePhoto}
              >
                <Camera className="h-8 w-8" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="bg-gray-800/80 text-white hover:bg-gray-700/80 rounded-full h-12 w-12 p-0"
                onClick={stopCamera}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show upload options
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">
              Capture Your {type === "workout" ? "Workout" : "Meal"}
            </h3>
            <p className="text-gray-600">
              {type === "workout"
                ? "Take a photo of your exercise session or equipment"
                : "Snap a picture of your meal or ingredients"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-24 flex flex-col space-y-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={startCamera}
            >
              <Camera className="h-8 w-8" />
              <span className="font-semibold">Use Camera</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white h-24 flex flex-col space-y-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 bg-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8" />
              <span className="font-semibold">Upload Photo</span>
            </Button>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>
      </CardContent>
    </Card>
  )
}
