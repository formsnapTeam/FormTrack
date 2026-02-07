const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    formTitle: {
        type: String,
        required: [true, 'Form title is required'],
        trim: true,
        maxlength: [200, 'Form title cannot exceed 200 characters']
    },
    formUrl: {
        type: String,
        required: [true, 'Form URL is required'],
        trim: true
    },
    company: {
        type: String,
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    category: {
        type: String,
        enum: ['Placement', 'Form'],
        default: 'Placement',
        index: true
    },
    status: {
        type: String,
        enum: [
            // Placement Statuses
            'Applied', 'Test', 'Interview', 'Shortlisted', 'Offer', 'Rejected',
            // General Form Statuses
            'Submitted', 'To Do', 'In Progress', 'Done'
        ],
        default: 'Applied'
    },
    deadline: {
        type: Date
    },
    notes: {
        type: String,
        maxlength: [2000, 'Notes cannot exceed 2000 characters']
    },
    tags: [{
        type: String,
        enum: ['Dream', 'Backup', 'Off-campus', 'PPO', 'Internship']
    }]
}, {
    timestamps: true
})

// Index for faster queries
applicationSchema.index({ userId: 1, createdAt: -1 })
applicationSchema.index({ userId: 1, status: 1 })

module.exports = mongoose.model('Application', applicationSchema)
