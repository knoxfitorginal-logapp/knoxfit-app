'use server'; // Ensures this runs only on the server in Next.js

// Prevent accidental client-side import
if (typeof window !== "undefined") {
  throw new Error("ai-tracking.ts should only be imported on the server");
}

import clientPromise from "./mongodb";
import { sendEmail, generateMotivationalEmail, generateWeeklyProgressEmail } from "./email";

export interface ConsistencyData {
  userId: string;
  email: string;
  firstName: string;
  currentStreak: number;
  longestStreak: number;
  totalUploads: number;
  lastUploadDate?: Date;
  cycleStartDate: Date;
  cycleEndDate: Date;
  missedDays: number;
  consistencyScore: number;
}

export async function calculateConsistencyScore(userId: string): Promise<number> {
  const client = await clientPromise;
  const db = client.db("knoxfit");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const logs = await db
    .collection("workout_logs")
    .find({ userId, timestamp: { $gte: thirtyDaysAgo } })
    .toArray();

  const logsByDate = new Map<string, number>();
  logs.forEach((log) => {
    const dateKey = log.timestamp.toISOString().split("T")[0];
    logsByDate.set(dateKey, (logsByDate.get(dateKey) || 0) + 1);
  });

  const daysWithLogs = logsByDate.size;
  const consistencyScore = Math.round((daysWithLogs / 30) * 100);
  return Math.min(consistencyScore, 100);
}

export async function checkAndResetCycles(): Promise<void> {
  const client = await clientPromise;
  const db = client.db("knoxfit");
  const now = new Date();

  const usersToReset = await db
    .collection("users")
    .find({
      "stats.lastStreakReset": {
        $lte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    })
    .toArray();

  for (const user of usersToReset) {
    const consistencyScore = await calculateConsistencyScore(user._id.toString());

    const updateData: any = {
      $set: {
        "stats.lastStreakReset": now,
        consistencyScore,
      },
    };

    if (consistencyScore < 50) {
      updateData.$set["stats.currentStreak"] = 0;
      updateData.$set.consistencyStreak = 0;
    }

    await db.collection("users").updateOne({ _id: user._id }, updateData);

    if (user.notificationSettings?.consistencyAlerts) {
      try {
        const weeklyStats = await getWeeklyStats(user._id.toString());
        const emailContent = generateWeeklyProgressEmail(user.firstName, weeklyStats);

        await sendEmail({
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      } catch (error) {
        console.error(`Failed to send cycle summary email to ${user.email}:`, error);
      }
    }
  }
}

export async function checkMissedLogs(): Promise<void> {
  const client = await clientPromise;
  const db = client.db("knoxfit");

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const cutoffTime = new Date(today);
  cutoffTime.setHours(20, 0, 0, 0);

  if (now < cutoffTime) return;

  const users = await db
    .collection("users")
    .find({
      "notificationSettings.motivationalReminders": true,
      $or: [
        { lastUploadDate: { $lt: today } },
        { lastUploadDate: { $exists: false } },
      ],
    })
    .toArray();

  for (const user of users) {
    try {
      const lastNotification = await db.collection("notifications").findOne({
        userId: user._id.toString(),
        type: "missed_log",
        sentAt: { $gte: today },
      });

      if (lastNotification) continue;

      const emailContent = generateMotivationalEmail(user.firstName, {
        currentStreak: user.stats?.currentStreak || 0,
        longestStreak: user.stats?.longestStreak || 0,
      });

      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });

      await db.collection("notifications").insertOne({
        userId: user._id.toString(),
        userEmail: user.email,
        type: "missed_log",
        sentAt: now,
        content: {
          subject: emailContent.subject,
          currentStreak: user.stats?.currentStreak || 0,
        },
      });

      console.log(`Sent motivational email to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send motivational email to ${user.email}:`, error);
    }
  }
}

export async function getWeeklyStats(userId: string) {
  const client = await clientPromise;
  const db = client.db("knoxfit");

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const logs = await db
    .collection("workout_logs")
    .find({ userId, timestamp: { $gte: weekAgo } })
    .toArray();

  const workouts = logs.filter((log) => log.type === "workout").length;
  const meals = logs.filter((log) => log.type === "diet").length;

  return { workouts, meals, total: logs.length };
}

export async function generateAIInsights(userId: string): Promise<string[]> {
  const client = await clientPromise;
  const db = client.db("knoxfit");

  const user = await db.collection("users").findOne({ _id: userId });
  if (!user) return [];

  const insights: string[] = [];
  const consistencyScore = await calculateConsistencyScore(userId);
  const weeklyStats = await getWeeklyStats(userId);

  if (consistencyScore >= 80) {
    insights.push("🔥 Excellent consistency! You're logging activities 4+ times per week.");
  } else if (consistencyScore >= 60) {
    insights.push("👍 Good consistency! Try to log activities more regularly for better results.");
  } else if (consistencyScore >= 40) {
    insights.push("📈 Your consistency is improving! Aim for at least 3 logs per week.");
  } else {
    insights.push("💪 Let's work on consistency! Regular logging helps build lasting habits.");
  }

  const currentStreak = user.stats?.currentStreak || 0;
  if (currentStreak >= 14) {
    insights.push("🏆 Amazing streak! You're building incredible momentum.");
  } else if (currentStreak >= 7) {
    insights.push("🎯 Great weekly streak! Keep the momentum going.");
  } else if (currentStreak >= 3) {
    insights.push("🌟 Nice streak building! Consistency is key to success.");
  }

  if (weeklyStats.workouts > weeklyStats.meals * 2) {
    insights.push("🍎 Consider logging more meals to balance your fitness tracking.");
  } else if (weeklyStats.meals > weeklyStats.workouts * 2) {
    insights.push("🏋️ Great nutrition tracking! Don't forget to log your workouts too.");
  } else if (weeklyStats.workouts > 0 && weeklyStats.meals > 0) {
    insights.push("⚖️ Perfect balance between workout and nutrition tracking!");
  }

  if (weeklyStats.total === 0) {
    insights.push("🚀 Ready to start? Your first log is just a photo away!");
  } else if (weeklyStats.total >= 7) {
    insights.push("🌟 Outstanding weekly activity! You're crushing your goals.");
  }

  return insights.slice(0, 3);
}
