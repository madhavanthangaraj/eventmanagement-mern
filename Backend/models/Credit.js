const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
    studentEmail: {
        type: String,
        required: [true, 'Student email is required'],
        ref: 'User'
    },
    studentName: {
        type: String,
        required: [true, 'Student name is required']
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event ID is required']
    },
    eventName: {
        type: String,
        required: [true, 'Event name is required']
    },
    creditPoints: {
        type: Number,
        required: [true, 'Credit points is required'],
        min: 0
    },
    awardedAt: {
        type: Date,
        default: Date.now
    },
    awardedBy: {
        type: String,
        ref: 'User'
    },
    proofId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proof'
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate credits for same event
creditSchema.index({ studentEmail: 1, eventId: 1 }, { unique: true });
creditSchema.index({ studentEmail: 1 });

const Credit = mongoose.model('Credit', creditSchema);
module.exports = Credit;
