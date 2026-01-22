const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event ID is required']
    },
    studentEmail: {
        type: String,
        required: [true, 'Student email is required'],
        ref: 'User'
    },
    studentName: {
        type: String,
        required: [true, 'Student name is required']
    },
    studentDepartment: {
        type: String,
        required: [true, 'Student department is required']
    },
    studentYear: {
        type: Number,
        required: [true, 'Student year is required']
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['REGISTERED', 'CANCELLED', 'ATTENDED', 'ABSENT'],
        default: 'REGISTERED'
    },
    cancellationReason: {
        type: String
    },
    cancelledAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ eventId: 1, studentEmail: 1 }, { unique: true });
registrationSchema.index({ studentEmail: 1 });
registrationSchema.index({ eventId: 1 });

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
