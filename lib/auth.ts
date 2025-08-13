import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import clientPromise from "./mongodb"
import type { User } from "./models/User"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
  } catch {
    return null
  }
}

export async function createUser(userData: Omit<User, "_id" | "createdAt" | "stats">): Promise<User> {
  const client = await clientPromise
  const db = client.db("knoxfit")

  const hashedPassword = await hashPassword(userData.password)

  const newUser: Omit<User, "_id"> = {
    ...userData,
    password: hashedPassword,
    createdAt: new Date(),
    consistencyStreak: 0,
    stats: {
      totalUploads: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastStreakReset: new Date(),
    },
  }

  const result = await db.collection("users").insertOne(newUser)
  return { ...newUser, _id: result.insertedId.toString() }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const client = await clientPromise
  const db = client.db("knoxfit")

  const user = await db.collection("users").findOne({ email })
  if (!user) return null

  return { ...user, _id: user._id.toString() }
}
