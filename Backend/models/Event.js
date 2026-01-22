const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['TECHNICAL', 'CULTURAL', 'SPORTS', 'WORKSHOP', 'SEMINAR', 'OTHER']
    },
    date: {
        type: Date,
        required: function() {
            return !this.startDate; // Only require date if startDate is not provided
        }
    },
    time: {
        type: String,
        required: function() {
            return !this.startDate; // Only require time if startDate is not provided
        }
    },
    venue: {
        type: String,
        required: function() {
            return this.mode !== 'ONLINE'; // Only require venue if not online
        }
    },
    maxParticipants: {
        type: Number,
        required: [true, 'Maximum participants is required'],
        min: 1
    },
    creditPoints: {
        type: Number,
        required: [true, 'Credit points is required'],
        min: 0
    },
    registrationDeadline: {
        type: Date,
        required: [true, 'Registration deadline is required']
    },
    eligibility: {
        type: [String],
        required: [true, 'Eligibility is required'],
        enum: ['CSE', 'EEE', 'ECE', 'CSBS', 'CCE', 'IT']
    },
    institution: {
        type: String,
        required: [true, 'Institution name is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
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
    mode: {
        type: String,
        required: [true, 'Event mode is required'],
        enum: ['ONLINE', 'OFFLINE', 'HYBRID']
    },
    websiteLink: {
        type: String,
        default: null
    },
    posterUrl: {
        type: String,
        default: null
    },
    brochureUrl: {
        type: String,
        default: null
    },
    organizerEmail: {
        type: String,
        required: [true, 'Organizer email is required'],
        ref: 'User'
    },
    organizerName: {
        type: String,
        required: [true, 'Organizer name is required']
    },
    organizerDepartment: {
        type: String,
        required: [true, 'Organizer department is required']
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    isCollegeEvent: {
        type: Boolean,
        default: false
    },
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
    },
    registeredParticipants: [{
        type: String,
        ref: 'User'
    }],
    currentRegistrations: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for better query performance
eventSchema.index({ organizerEmail: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ organizerDepartment: 1 });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
