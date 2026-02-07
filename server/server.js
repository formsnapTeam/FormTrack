require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const applicationRoutes = require('./routes/applications')
const reminderRoutes = require('./routes/reminders')

const app = express()

// Middleware
// Allow all origins for bookmarklet to work from any site
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/reminders', reminderRoutes)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    })
})

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/formtrack')
    .then(() => {
        console.log('✅ Connected to MongoDB')
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`)
        })
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err)
        process.exit(1)
    })
