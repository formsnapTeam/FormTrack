const express = require('express')
const auth = require('../middleware/auth')
const { sendTestReminder, checkAndSendReminders } = require('../services/emailService')

const router = express.Router()

// @route   POST /api/reminders/test
// @desc    Send a test reminder email to current user
// @access  Private
router.post('/test', auth, async (req, res, next) => {
    try {
        await sendTestReminder(req.user._id)
        res.json({
            success: true,
            message: 'Test reminder sent to your email!'
        })
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ success: false, message: error.message })
        }
        next(error)
    }
})

// @route   POST /api/reminders/send-all
// @desc    Trigger reminder check for all users (admin/cron use)
// @access  Private (should be admin-only in production)
router.post('/send-all', auth, async (req, res, next) => {
    try {
        const results = await checkAndSendReminders()
        res.json({
            success: true,
            message: `Sent ${results.filter(r => r.success).length} reminders`,
            results
        })
    } catch (error) {
        next(error)
    }
})

// @route   GET /api/reminders/status
// @desc    Check reminder configuration status
// @access  Private
router.get('/status', auth, async (req, res) => {
    const configured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    res.json({
        success: true,
        configured,
        message: configured
            ? 'Email reminders are configured'
            : 'Email credentials not set. Add EMAIL_USER and EMAIL_PASS to .env'
    })
})

module.exports = router
