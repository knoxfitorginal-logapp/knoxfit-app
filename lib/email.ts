import nodemailer from "nodemailer"

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  try {
    const transporter = nodemailer.createTransporter(SMTP_CONFIG)

    const mailOptions = {
      from: `"KN0X-FIT" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Email sending failed:", error)
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function generateMotivationalEmail(firstName: string, streakData: any) {
  const motivationalMessages = [
    "Your fitness journey is important, and every day counts!",
    "Consistency is the key to achieving your fitness goals.",
    "Don't let one missed day break your amazing progress!",
    "Your future self will thank you for staying committed today.",
    "Small daily actions lead to big results over time.",
  ]

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Don't Break Your Streak!</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
            .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
            .content { padding: 40px 20px; }
            .streak-info { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
            .streak-number { font-size: 48px; font-weight: bold; color: #d97706; margin: 0; }
            .streak-text { color: #92400e; font-size: 16px; margin: 5px 0 0 0; }
            .message { font-size: 18px; line-height: 1.6; color: #374151; margin: 20px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏋️ KN0X-FIT</h1>
                <p>Don't let your streak slip away!</p>
            </div>
            <div class="content">
                <h2>Hi ${firstName}!</h2>
                <p class="message">${randomMessage}</p>
                
                ${
                  streakData.currentStreak > 0
                    ? `
                <div class="streak-info">
                    <div class="streak-number">${streakData.currentStreak}</div>
                    <p class="streak-text">Day Streak - Don't break it now!</p>
                </div>
                `
                    : `
                <div class="streak-info">
                    <div class="streak-number">0</div>
                    <p class="streak-text">Start your streak today!</p>
                </div>
                `
                }
                
                <p>We noticed you haven't logged your workout or meal today. It's not too late to keep your momentum going!</p>
                
                <p>Remember:</p>
                <ul>
                    <li>📸 Quick photo uploads take less than 2 minutes</li>
                    <li>🔥 Consistency builds lasting habits</li>
                    <li>📈 Every log helps track your progress</li>
                    <li>💪 You're stronger than you think!</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://knoxfit.vercel.app"}/upload" class="cta-button">
                        Log Your Activity Now
                    </a>
                </div>
                
                <p style="margin-top: 30px; font-size: 16px; color: #6b7280;">
                    Keep pushing forward, ${firstName}. Your fitness journey matters! 💪
                </p>
            </div>
            <div class="footer">
                <p>You're receiving this because you have motivational reminders enabled.</p>
                <p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://knoxfit.vercel.app"}/settings" style="color: #3b82f6;">
                        Update notification preferences
                    </a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `

  return {
    subject: `🔥 Don't break your ${streakData.currentStreak}-day streak, ${firstName}!`,
    html,
  }
}

export function generateWeeklyProgressEmail(firstName: string, weeklyStats: any) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Weekly Progress</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #10b981, #3b82f6); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
            .content { padding: 40px 20px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .stat-card { background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; }
            .stat-number { font-size: 32px; font-weight: bold; color: #059669; margin: 0; }
            .stat-label { color: #6b7280; font-size: 14px; margin: 5px 0 0 0; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Weekly Progress Report</h1>
            </div>
            <div class="content">
                <h2>Great week, ${firstName}! 🎉</h2>
                <p>Here's how you performed this week:</p>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${weeklyStats.workouts}</div>
                        <p class="stat-label">Workouts Logged</p>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${weeklyStats.meals}</div>
                        <p class="stat-label">Meals Tracked</p>
                    </div>
                </div>
                
                <p>Keep up the excellent work! Consistency is key to reaching your fitness goals.</p>
            </div>
            <div class="footer">
                <p>KN0X-FIT - Your AI-Powered Fitness Companion</p>
            </div>
        </div>
    </body>
    </html>
  `

  return {
    subject: `📊 Your weekly progress summary, ${firstName}!`,
    html,
  }
}
