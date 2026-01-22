const mongoose = require('mongoose');

const proofSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event ID is required']
    },
    eventName: {
        type: String,
        required: [true, 'Event name is required']
    },
    eventCategory: {
        type: String,
        required: [true, 'Event category is required']
    },
    eventDate: {
        type: Date,
        required: [true, 'Event date is required']
    },
    creditPoints: {
        type: Number,
        required: [true, 'Credit points is required']
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
    proofDocument: {
        type: String,
        required: [true, 'Proof document is required']
    },
    proofDescription: {
        type: String,
        required: [true, 'Proof description is required']
    },
    status: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'REJECTED'],
        default: 'PENDING'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    verifiedAt: {
        type: Date
    },
    verifiedBy: {
        type: String,
        ref: 'User'
    },
    rejectedAt: {
        type: Date
    },
    rejectedBy: {
        type: String,
        ref: 'User'
    },
    mentorRemarks: {
        type: String
    }
}, {
    timestamps: true
});

// Index for better query performance
proofSchema.index({ studentEmail: 1 });
proofSchema.index({ status: 1 });
proofSchema.index({ eventId: 1 });

const Proof = mongoose.model('Proof', proofSchema);
module.exports = Proof;
