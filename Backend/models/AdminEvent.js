const mongoose = require('mongoose');

const adminEventSchema = new mongoose.Schema({
    eventTitle: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    eventType: {
        type: String,
        required: [true, 'Event type is required'],
        enum: ['Inter-College', 'Intra-College', 'National', 'International']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['TECHNICAL', 'CULTURAL', 'SPORTS', 'WORKSHOP', 'SEMINAR', 'OTHER']
    },
    eligibility: {
        type: [String],
        required: [true, 'Eligibility is required'],
        enum: ['CSE', 'EEE', 'ECE', 'CSBS', 'CCE', 'IT']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    venue: {
        type: String,
        required: function() {
            return this.mode !== 'ONLINE'; // Only require venue if not online
        },
        trim: true
    },
    organizingCollegeName: {
        type: String,
        required: [true, 'Organizing college name is required'],
        trim: true
    },
    registrationDeadline: {
        type: Date,
        required: [true, 'Registration deadline is required']
    },
    maxParticipants: {
        type: Number,
        required: [true, 'Maximum participants is required'],
        min: 1
    },
    approvalStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'APPROVED' // Admin-created events are auto-approved
    },
    posterUrl: {
        type: String,
        default: null,
        validate: {
            validator: function(v) {
                return v === null || v === '' || /^https?:\/\/.+/.test(v);
            },
            message: 'Please enter a valid URL (include http:// or https://)'
        }
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    mode: {
        type: String,
        required: [true, 'Event mode is required'],
        enum: ['ONLINE', 'OFFLINE', 'HYBRID'],
        default: 'OFFLINE'
    },
    registrationLink: {
        type: String,
        required: [true, 'Registration link is required'],
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Please enter a valid URL (include http:// or https://)'
        }
    },
    creditPoints: {
        type: Number,
        required: [true, 'Credit points is required'],
        min: 0,
        default: 10
    },
    // Admin who created this event
    createdBy: {
        type: String,
        required: [true, 'Creator is required'],
        ref: 'User'
    },
    createdByName: {
        type: String,
        required: [true, 'Creator name is required']
    },
    createdByDepartment: {
        type: String,
        required: [true, 'Creator department is required']
    },
    // Registration tracking
    registeredParticipants: [{
        type: String,
        ref: 'User'
    }],
    currentRegistrations: {
        type: Number,
        default: 0
    },
    // Status tracking
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
        default: 'APPROVED'
    },
    // Approval tracking (for admin events that might need higher approval)
    approvedBy: {
        type: String,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectedBy: {
        type: String,
        ref: 'User'
    },
    rejectedAt: {
        type: Date
    },
    adminRemarks: {
        type: String
    }
}, {
    timestamps: true
});

// Index for better query performance
adminEventSchema.index({ createdBy: 1 });
adminEventSchema.index({ createdByDepartment: 1 });
adminEventSchema.index({ status: 1 });
adminEventSchema.index({ startDate: 1 });
adminEventSchema.index({ category: 1 });

// Virtual for checking if registration is still open
adminEventSchema.virtual('isRegistrationOpen').get(function() {
    return new Date() < new Date(this.registrationDeadline) && this.currentRegistrations < this.maxParticipants;
});

// Virtual for checking if event is full
adminEventSchema.virtual('isFull').get(function() {
    return this.currentRegistrations >= this.maxParticipants;
});

// Ensure virtuals are included in JSON
adminEventSchema.set('toJSON', { virtuals: true });
adminEventSchema.set('toObject', { virtuals: true });

const AdminEvent = mongoose.model('AdminEvent', adminEventSchema);
module.exports = AdminEvent;
