export interface User {
  _id?: string
  email: string
  password: string
  firstName: string
  lastName: string
  createdAt: Date
  lastLogin?: Date
  consistencyStreak: number
  lastUploadDate?: Date
  notificationSettings: {
    motivationalReminders: boolean
    consistencyAlerts: boolean
  }
  stats: {
    totalUploads: number
    currentStreak: number
    longestStreak: number
    lastStreakReset: Date
  }
}

export interface WorkoutLog {
  _id?: string
  userId: string
  userEmail: string
  type: "workout" | "diet"
  imageUrl: string
  driveFileId: string
  timestamp: Date
  aiAnalysis?: {
    detectedActivity?: string
    confidence?: number
    suggestions?: string[]
  }
}
