const Proof = require('../models/Proof');
const Event = require('../models/Event');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Submit proof for event participation
// @route   POST /api/student/submit-proof
// @access  Private/Student
exports.submitProof = async (req, res, next) => {
    try {
        const { eventId, eventName, organizationName, driveLink, description } = req.body;

        // Validate required fields
        if (!eventId || !eventName || !organizationName || !driveLink || !description) {
            return next(new ErrorResponse('Please provide all required fields', 400));
        }

        // Get event details
        const event = await Event.findById(eventId);
        if (!event) {
            return next(new ErrorResponse('Event not found', 404));
        }

        // Check if student is registered for this event
        const Registration = require('../models/Registration');
        const registration = await Registration.findOne({
            eventId: eventId,
            studentEmail: req.user.email
        });

        if (!registration) {
            return next(new ErrorResponse('You must be registered for this event to submit proof', 400));
        }

        // Check if proof already exists and is not rejected
        const existingProof = await Proof.findOne({
            eventId: eventId,
            studentEmail: req.user.email,
            status: { $in: ['PENDING', 'VERIFIED'] }
        });

        if (existingProof) {
            return next(new ErrorResponse('You have already submitted proof for this event', 400));
        }

        // Create proof with student details from JWT token
        const proof = await Proof.create({
            eventId: eventId,
            eventName: eventName,
            eventCategory: event.category,
            eventDate: event.date,
            creditPoints: event.creditPoints,
            studentEmail: req.user.email,
            studentName: req.user.name,
            studentDepartment: req.user.department,
            studentYear: req.user.year,
            proofDescription: description,
            organizationName: organizationName,
            driveLink: driveLink,
            status: 'PENDING'
        });

        res.status(201).json({
            success: true,
            message: 'Proof submitted successfully',
            data: proof
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get student reports with registrations and credits
// @route   GET /api/student/reports
// @access  Private/Student
exports.getStudentReports = async (req, res, next) => {
    try {
        const Registration = require('../models/Registration');
        const Event = require('../models/Event');
        const Proof = require('../models/Proof');

        // Get all registrations for the student
        const registrations = await Registration.find({ studentEmail: req.user.email })
            .sort({ registrationDate: -1 });

        // Get proof status for each registration
        const reports = await Promise.all(
            registrations.map(async (registration) => {
                const event = await Event.findById(registration.eventId);
                const proof = await Proof.findOne({
                    eventId: registration.eventId,
                    studentEmail: req.user.email
                });

                return {
                    eventId: registration.eventId,
                    eventName: event ? event.eventName : 'Unknown Event',
                    organizerName: event ? event.organizerName : 'N/A',
                    eventStatus: event ? event.status : 'UNKNOWN',
                    registrationDate: registration.registrationDate,
                    proofStatus: proof ? proof.status : 'NOT_SUBMITTED',
                    credits: registration.credits,
                    creditAwardedAt: registration.creditAwardedAt,
                    creditAwardedBy: registration.creditAwardedBy,
                    mentorRemarks: proof ? proof.mentorRemarks : null
                };
            })
        );

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get student credits
// @route   GET /api/student/credits
// @access  Private/Student
exports.getStudentCredits = async (req, res, next) => {
    try {
        const Credit = require('../models/Credit');
        
        // Get all credits for the student
        const credits = await Credit.find({ studentEmail: req.user.email })
            .sort({ awardedAt: -1 });
            
        // Calculate total credits
        const totalCredits = credits.reduce((total, credit) => total + credit.creditPoints, 0);
        
        res.status(200).json({
            success: true,
            count: credits.length,
            totalCredits,
            data: credits
        });

    } catch (error) {
        next(error);
    }
};
