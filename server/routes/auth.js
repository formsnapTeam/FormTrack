const express = require('express')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { Resend } = require('resend')

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )
}

// Send email using Resend
const sendEmail = async (to, subject, html) => {
    const { data, error } = await resend.emails.send({
        from: 'FormSnap <onboarding@resend.dev>',
        to: [to],
        subject,
        html
    })

    if (error) {
        throw new Error(error.message)
    }
    return data
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        // Check if user exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists'
            })
        }

        // Create user
        const user = await User.create({ name, email, password })
        const token = generateToken(user._id)

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message)
            return res.status(400).json({
                success: false,
                message: messages[0]
            })
        }
        next(error)
    }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            })
        }

        // Find user with password
        const user = await User.findOne({ email }).select('+password')
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'No account registered with this email'
            })
        }

        // Check password
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                code: 'WRONG_PASSWORD',
                message: 'Incorrect password'
            })
        }

        const token = generateToken(user._id)

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        next(error)
    }
})

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            })
        }

        const user = await User.findOne({ email })
        if (!user) {
            // Don't reveal if user exists for security
            return res.json({
                success: true,
                message: 'If an account exists, a reset link has been sent'
            })
        }

        // Generate reset token
        const resetToken = user.createPasswordResetToken()
        await user.save({ validateBeforeSave: false })

        // Create reset URL
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`

        // Send email
        try {
            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0f; color: #f1f5f9; padding: 20px; margin: 0; }
        .container { max-width: 500px; margin: 0 auto; background: #16161f; border-radius: 16px; padding: 32px; }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 40px; }
        .title { color: #f1f5f9; font-size: 24px; margin: 16px 0 8px; }
        .text { color: #94a3b8; font-size: 14px; line-height: 1.6; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white !important; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 24px 0; }
        .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; }
        .warning { background: rgba(251, 146, 60, 0.15); border: 1px solid rgba(251, 146, 60, 0.3); border-radius: 8px; padding: 12px; margin-top: 16px; color: #fb923c; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📸</div>
            <h1 class="title">Reset Your Password</h1>
        </div>
        
        <p class="text">Hi ${user.name},</p>
        <p class="text">We received a request to reset your FormSnap password. Click the button below to create a new password:</p>
        
        <div style="text-align: center;">
            <a href="${resetUrl}" class="btn">Reset Password →</a>
        </div>
        
        <div class="warning">
            ⏰ This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} FormSnap. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            `

            await sendEmail(user.email, '🔐 Reset Your FormSnap Password', emailHtml)

            res.json({
                success: true,
                message: 'Password reset link sent to your email'
            })
        } catch (emailError) {
            // Clear reset token if email fails
            user.resetPasswordToken = undefined
            user.resetPasswordExpires = undefined
            await user.save({ validateBeforeSave: false })

            console.error('Email error:', emailError)
            return res.status(500).json({
                success: false,
                message: 'Failed to send email. Please try again later.'
            })
        }
    } catch (error) {
        next(error)
    }
})

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', async (req, res, next) => {
    try {
        const { password } = req.body
        const { token } = req.params

        console.log('Reset password attempt for token:', token.substring(0, 10) + '...')

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a new password'
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            })
        }

        // Hash the token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')

        console.log('Looking for user with hashed token...')

        // Find user with valid token - must select password to allow updating it
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+password +resetPasswordToken +resetPasswordExpires')

        if (!user) {
            console.log('No user found with valid token')
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            })
        }

        console.log('User found:', user.email, '- updating password...')

        // Update password
        user.password = password
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        console.log('Password updated successfully for:', user.email)

        // Generate new login token
        const authToken = generateToken(user._id)

        res.json({
            success: true,
            message: 'Password reset successful',
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.error('Reset password error:', error)
        next(error)
    }
})

// @route   GET /api/auth/verify-reset-token/:token
// @desc    Verify if reset token is valid
// @access  Public
router.get('/verify-reset-token/:token', async (req, res, next) => {
    try {
        const { token } = req.params

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires')

        if (!user) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: 'Invalid or expired reset token'
            })
        }

        res.json({
            success: true,
            valid: true,
            email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Masked email
        })
    } catch (error) {
        next(error)
    }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
        }
    })
})

module.exports = router
