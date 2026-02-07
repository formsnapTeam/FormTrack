const nodemailer = require('nodemailer')
const Application = require('../models/Application')
const User = require('../models/User')

// Create transporter (using Gmail as example)
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })
}

/**
 * Send reminder email for upcoming deadlines
 */
const sendDeadlineReminder = async (userEmail, userName, applications) => {
    const transporter = createTransporter()

    const appList = applications.map(app =>
        `• ${app.company || 'Unknown'} - ${app.formTitle} (Due: ${new Date(app.deadline).toLocaleDateString()})`
    ).join('\n')

    const mailOptions = {
        from: `"FormSnap" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `⏰ FormSnap: ${applications.length} Deadline${applications.length > 1 ? 's' : ''} Coming Up!`,
        text: `
Hi ${userName}!

You have ${applications.length} application deadline${applications.length > 1 ? 's' : ''} coming up in the next 3 days:

${appList}

Don't miss out! Visit FormSnap to review your applications.

Best of luck! 🍀
The FormSnap Team
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0f; color: #f1f5f9; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #16161f; border-radius: 16px; padding: 32px; }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 32px; }
        .title { color: #f1f5f9; font-size: 24px; margin: 16px 0 8px; }
        .subtitle { color: #94a3b8; font-size: 14px; }
        .app-card { background: #1e1e2a; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin: 12px 0; }
        .app-company { color: #6366f1; font-weight: 600; font-size: 16px; }
        .app-title { color: #94a3b8; font-size: 14px; margin-top: 4px; }
        .deadline { color: #fb923c; font-weight: 600; margin-top: 8px; font-size: 13px; }
        .cta { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
        .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📸</div>
            <h1 class="title">Deadline Reminder</h1>
            <p class="subtitle">You have ${applications.length} upcoming deadline${applications.length > 1 ? 's' : ''}</p>
        </div>
        
        ${applications.map(app => `
            <div class="app-card">
                <div class="app-company">${app.company || 'Application'}</div>
                <div class="app-title">${app.formTitle}</div>
                <div class="deadline">⏰ Due: ${new Date(app.deadline).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
            </div>
        `).join('')}
        
        <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="cta">View Dashboard →</a>
        </div>
        
        <div class="footer">
            <p>Best of luck! 🍀</p>
            <p>The FormSnap Team</p>
        </div>
    </div>
</body>
</html>
        `
    }

    return transporter.sendMail(mailOptions)
}

/**
 * Check and send reminders for all users with upcoming deadlines
 * Should be called by a cron job (e.g., daily at 9 AM)
 */
const checkAndSendReminders = async () => {
    try {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)

        const threeDaysLater = new Date()
        threeDaysLater.setDate(threeDaysLater.getDate() + 3)
        threeDaysLater.setHours(23, 59, 59, 999)

        // Find all applications with deadlines in next 3 days
        const applications = await Application.find({
            deadline: { $gte: tomorrow, $lte: threeDaysLater },
            status: { $nin: ['Offer', 'Rejected'] } // Skip completed ones
        }).populate('userId', 'name email')

        // Group by user
        const byUser = {}
        applications.forEach(app => {
            const userId = app.userId._id.toString()
            if (!byUser[userId]) {
                byUser[userId] = {
                    user: app.userId,
                    apps: []
                }
            }
            byUser[userId].apps.push(app)
        })

        // Send emails
        const results = []
        for (const userId in byUser) {
            const { user, apps } = byUser[userId]
            try {
                await sendDeadlineReminder(user.email, user.name, apps)
                results.push({ userId, success: true, count: apps.length })
            } catch (error) {
                results.push({ userId, success: false, error: error.message })
            }
        }

        return results
    } catch (error) {
        console.error('Error checking reminders:', error)
        throw error
    }
}

/**
 * Send a test reminder email to a specific user
 */
const sendTestReminder = async (userId) => {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    const applications = await Application.find({
        userId,
        deadline: { $exists: true, $ne: null }
    }).limit(3)

    if (applications.length === 0) {
        // Send with sample data
        return sendDeadlineReminder(user.email, user.name, [
            { company: 'Sample Company', formTitle: 'Test Application', deadline: new Date() }
        ])
    }

    return sendDeadlineReminder(user.email, user.name, applications)
}

module.exports = {
    sendDeadlineReminder,
    checkAndSendReminders,
    sendTestReminder
}
