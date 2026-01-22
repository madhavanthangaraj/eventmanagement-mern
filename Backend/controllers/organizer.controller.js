const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Proof = require('../models/Proof');
const Credit = require('../models/Credit');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get organizer dashboard stats
// @route   GET /api/organizer/dashboard
// @access  Private/Organizer
exports.getDashboardStats = async (req, res, next) => {
    try {
        const organizerEmail = req.user.email;

        // Get organizer's events
        const events = await Event.find({ organizerEmail });
        
        // Calculate stats
        const totalEvents = events.length;
        const pendingEvents = events.filter(e => e.status === 'PENDING').length;
        const approvedEvents = events.filter(e => e.status === 'APPROVED').length;
        const completedEvents = events.filter(e => e.status === 'COMPLETED').length;

        // Get total registrations for organizer's events
        const eventIds = events.map(e => e._id);
        const totalRegistrations = await Registration.countDocuments({
            eventId: { $in: eventIds },
            status: 'REGISTERED'
        });

        // Get recent events
        const recentEvents = await Event.find({ organizerEmail })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('registeredParticipants', 'name email');

        // Get events with registration counts
        const eventsWithRegistrations = await Event.aggregate([
            { $match: { organizerEmail } },
            {
                $lookup: {
                    from: 'registrations',
                    localField: '_id',
                    foreignField: 'eventId',
                    as: 'registrations'
                }
            },
            {
                $addFields: {
                    registrationCount: { $size: '$registrations' }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalEvents,
                pendingEvents,
                approvedEvents,
                completedEvents,
                totalRegistrations,
                recentEvents,
                eventsWithRegistrations
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all organizer events with details
// @route   GET /api/organizer/events
// @access  Private/Organizer
exports.getOrganizerEvents = async (req, res, next) => {
    try {
        const organizerEmail = req.user.email;

        const events = await Event.aggregate([
            { $match: { organizerEmail } },
            {
                $lookup: {
                    from: 'registrations',
                    localField: '_id',
                    foreignField: 'eventId',
                    as: 'registrations'
                }
            },
            {
                $addFields: {
                    registrationCount: { $size: '$registrations' },
                    currentRegistrations: { $size: '$registrations' }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get event registrations for organizer
// @route   GET /api/organizer/registrations
// @access  Private/Organizer
exports.getOrganizerRegistrations = async (req, res, next) => {
    try {
        const organizerEmail = req.user.email;

        // Get organizer's events
        const events = await Event.find({ organizerEmail });
        const eventIds = events.map(e => e._id);

        // Get registrations for organizer's events
        const registrations = await Registration.aggregate([
            { $match: { eventId: { $in: eventIds } } },
            {
                $lookup: {
                    from: 'events',
                    localField: 'eventId',
                    foreignField: '_id',
                    as: 'event'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'studentEmail',
                    foreignField: 'email',
                    as: 'student'
                }
            },
            {
                $unwind: '$event'
            },
            {
                $unwind: '$student'
            },
            { $sort: { registrationDate: -1 } }
        ]);

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: registrations
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all proofs for organizer's events
// @route   GET /api/organizer/proofs
// @access  Private/Organizer
exports.getOrganizerProofs = async (req, res, next) => {
    try {
        const organizerEmail = req.user.email;

        // Get organizer's events
        const events = await Event.find({ organizerEmail });
        const eventIds = events.map(e => e._id);

        // Get proofs for organizer's events
        const proofs = await Proof.find({ eventId: { $in: eventIds } })
            .populate('studentEmail', 'name email department year')
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            count: proofs.length,
            data: proofs
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all credits awarded for organizer's events
// @route   GET /api/organizer/credits
// @access  Private/Organizer
exports.getOrganizerCredits = async (req, res, next) => {
    try {
        const organizerEmail = req.user.email;

        // Get organizer's events
        const events = await Event.find({ organizerEmail });
        const eventIds = events.map(e => e._id);

        // Get credits for organizer's events
        const credits = await Credit.find({ eventId: { $in: eventIds } })
            .populate('studentEmail', 'name email department year')
            .sort({ awardedAt: -1 });

        res.status(200).json({
            success: true,
            count: credits.length,
            data: credits
        });
    } catch (error) {
        next(error);
    }
};
