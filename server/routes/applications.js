const express = require('express')
const Application = require('../models/Application')
const auth = require('../middleware/auth')

const router = express.Router()

// All routes require authentication
router.use(auth)

// @route   GET /api/applications
// @desc    Get all applications for current user
// @access  Private
router.get('/', async (req, res, next) => {
    try {
        const { status, search, sort = '-createdAt' } = req.query

        const query = { userId: req.user._id }

        // Filter by status
        if (status) {
            query.status = status
        }

        // Search by title or company
        if (search) {
            query.$or = [
                { formTitle: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } }
            ]
        }

        const applications = await Application.find(query)
            .sort(sort)
            .lean()

        res.json(applications)
    } catch (error) {
        next(error)
    }
})

// @route   GET /api/applications/analytics
// @desc    Get analytics for current user
// @access  Private
router.get('/analytics', async (req, res, next) => {
    try {
        const applications = await Application.find({ userId: req.user._id }).lean()

        // Calculate stats
        const stats = {
            total: applications.length,
            byStatus: {},
            byCategory: {},
            byTag: {}
        }

        applications.forEach(app => {
            // Count by status
            stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1

            // Count by category
            const category = app.category || 'Placement'
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1

            // Count by tags
            if (app.tags && app.tags.length > 0) {
                app.tags.forEach(tag => {
                    stats.byTag[tag] = (stats.byTag[tag] || 0) + 1
                })
            }
        })

        res.json(stats)
    } catch (error) {
        next(error)
    }
})

// @route   POST /api/applications
// @desc    Create application manually
// @access  Private
router.post('/', async (req, res, next) => {
    try {
        const { formTitle, formUrl, company, category, status, deadline, notes, tags } = req.body

        if (!formTitle || !formUrl) {
            return res.status(400).json({
                success: false,
                message: 'Form title and URL are required'
            })
        }

        const application = await Application.create({
            userId: req.user._id,
            formTitle,
            formUrl,
            company: company || '',
            category: category || 'Placement',
            status: status || (category === 'Form' ? 'Submitted' : 'Applied'),
            deadline: deadline || null,
            notes: notes || '',
            tags: tags || []
        })

        res.status(201).json(application)
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

// @route   POST /api/applications/bookmarklet
// @desc    Create application from bookmarklet
// @access  Private
router.post('/bookmarklet', async (req, res, next) => {
    try {
        const { formTitle, formUrl, category } = req.body

        if (!formTitle || !formUrl) {
            return res.status(400).json({
                success: false,
                message: 'Form title and URL are required'
            })
        }

        // Check for duplicate URL
        const existing = await Application.findOne({
            userId: req.user._id,
            formUrl
        })

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'This form has already been saved'
            })
        }

        // Extract company name from title if possible
        let company = ''
        const titleLower = formTitle.toLowerCase()
        if (titleLower.includes('google')) company = 'Google'
        else if (titleLower.includes('microsoft')) company = 'Microsoft'
        else if (titleLower.includes('amazon')) company = 'Amazon'
        else if (titleLower.includes('meta') || titleLower.includes('facebook')) company = 'Meta'
        // Add more company patterns as needed

        const application = await Application.create({
            userId: req.user._id,
            formTitle,
            formUrl,
            company,
            category: category || 'Placement',
            status: (category === 'Form' ? 'Submitted' : 'Applied')
        })

        res.status(201).json({
            success: true,
            application
        })
    } catch (error) {
        next(error)
    }
})

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', async (req, res, next) => {
    try {
        const application = await Application.findOne({
            _id: req.params.id,
            userId: req.user._id
        })

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            })
        }

        res.json(application)
    } catch (error) {
        next(error)
    }
})

// @route   PATCH /api/applications/:id
// @desc    Update application
// @access  Private
router.patch('/:id', async (req, res, next) => {
    try {
        const allowedUpdates = ['formTitle', 'company', 'category', 'status', 'deadline', 'notes', 'tags']
        const updates = {}

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key]
            }
        })

        const application = await Application.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            updates,
            { new: true, runValidators: true }
        )

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            })
        }

        res.json(application)
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

// @route   DELETE /api/applications/:id
// @desc    Delete application
// @access  Private
router.delete('/:id', async (req, res, next) => {
    try {
        const application = await Application.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        })

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            })
        }

        res.json({
            success: true,
            message: 'Application deleted'
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router
