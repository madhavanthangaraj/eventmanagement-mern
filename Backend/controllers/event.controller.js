const Event = require('../models/Event');
const Registration = require('../models/Registration');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Organizer
exports.createEvent = async (req, res, next) => {
    try {
        const eventData = {
            ...req.body,
            organizerEmail: req.user.email,
            organizerName: req.user.name,
            organizerDepartment: req.user.department,
            status: req.body.isCollegeEvent ? 'APPROVED' : 'PENDING'
        };

        // Validate required fields
        const requiredFields = ['eventName', 'category', 'description', 'eligibility'];
        for (const field of requiredFields) {
            if (!eventData[field] || (Array.isArray(eventData[field]) && eventData[field].length === 0)) {
                return next(new ErrorResponse(`${field} is required`, 400));
            }
        }

        // Validate dates
        if (eventData.startDate && eventData.endDate) {
            const startDate = new Date(eventData.startDate);
            const endDate = new Date(eventData.endDate);
            if (endDate < startDate) {
                return next(new ErrorResponse('End date cannot be before start date', 400));
            }
        }

        // Validate registration deadline
        if (eventData.registrationDeadline && eventData.startDate) {
            const deadlineDate = new Date(eventData.registrationDeadline);
            const eventDate = new Date(eventData.startDate);
            if (deadlineDate > eventDate) {
                return next(new ErrorResponse('Registration deadline must be before event date', 400));
            }
        }

        // Validate URL if provided
        if (eventData.registrationLink) {
            const urlRegex = /^https?:\/\/.+/;
            if (!urlRegex.test(eventData.registrationLink)) {
                return next(new ErrorResponse('Please enter a valid URL (include http:// or https://)', 400));
            }
        }

        // Validate poster URL if provided
        if (eventData.posterUrl) {
            const urlRegex = /^https?:\/\/.+/;
            if (!urlRegex.test(eventData.posterUrl)) {
                return next(new ErrorResponse('Please enter a valid poster URL (include http:// or https://)', 400));
            }
        }

        // Set isExternal flag if provided in request
        if (eventData.isExternal !== undefined) {
            eventData.isExternal = eventData.isExternal;
        }

        // Set default date and time if not provided
        if (!eventData.date && eventData.startDate) {
            eventData.date = eventData.startDate;
        }
        if (!eventData.time && eventData.startDate) {
            eventData.time = '09:00'; // Default time
        }

        const event = await Event.create(eventData);

        res.status(201).json({
            success: true,
            data: event,
            message: 'Event created successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
exports.getAllEvents = async (req, res, next) => {
    try {
        let query = {};
        
        // If organizer, only show their events
        if (req.user.role === 'ORGANIZER') {
            query.organizerEmail = req.user.email;
        }
        
        // Get regular events
        const regularEvents = await Event.find(query).sort({ createdAt: -1 });
        
        // Get admin events (only if not organizer, since organizers don't create admin events)
        let adminEvents = [];
        if (req.user.role !== 'ORGANIZER') {
            const AdminEvent = require('../models/AdminEvent');
            let adminQuery = {};
            
            // If admin, only show admin events from their department
            if (req.user.role === 'ADMIN') {
                adminQuery.createdByDepartment = req.user.department;
            }
            
            adminEvents = await AdminEvent.find(adminQuery).sort({ createdAt: -1 });
        }
        
        // Merge both types of events
        const allEvents = [...regularEvents, ...adminEvents].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Normalize event data to have consistent field names
        const normalizedEvents = allEvents.map(event => {
            // If it's an admin event, normalize field names
            if (event.eventTitle) {
                return {
                    ...event._doc,
                    id: event._id,
                    eventName: event.eventTitle,
                    organizerName: event.organizingCollegeName,
                    organizerDepartment: event.createdByDepartment,
                    date: event.startDate,
                    endDate: event.endDate,
                    registrationDeadline: event.registrationDeadline,
                    maxParticipants: event.maxParticipants,
                    description: event.description,
                    mode: event.mode,
                    venue: event.venue,
                    contactPerson: event.contactPerson,
                    contactEmail: event.contactEmail,
                    contactPhone: event.contactPhone,
                    isCollegeEvent: true,
                    // Keep admin-specific fields
                    eventType: event.eventType,
                    createdByName: event.createdByName,
                    createdByDepartment: event.createdByDepartment
                };
            }
            // Regular event - ensure consistent field names
            return {
                ...event._doc,
                id: event._id,
                isCollegeEvent: false
            };
        });

        res.status(200).json({
            success: true,
            count: normalizedEvents.length,
            data: normalizedEvents
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
exports.getEventById = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return next(new ErrorResponse('Event not found', 404));
        }

        // Check permissions
        if (req.user.role === 'ORGANIZER' && event.organizerEmail !== req.user.email) {
            return next(new ErrorResponse('Not authorized to view this event', 403));
        }

        if (req.user.role === 'ADMIN' && event.organizerDepartment !== req.user.department) {
            return next(new ErrorResponse('Not authorized to view this event', 403));
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Organizer
exports.updateEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return next(new ErrorResponse('Event not found', 404));
        }

        // Check permissions
        if (event.organizerEmail !== req.user.email) {
            return next(new ErrorResponse('Not authorized to update this event', 403));
        }

        // For college events, allow updates regardless of status
        if (!event.isCollegeEvent && event.status !== 'PENDING') {
            return next(new ErrorResponse('Only pending events can be updated', 400));
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedEvent,
            message: 'Event updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Organizer
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return next(new ErrorResponse('Event not found', 404));
        }

        // Check permissions
        if (event.organizerEmail !== req.user.email) {
            return next(new ErrorResponse('Not authorized to delete this event', 403));
        }

        // Prevent deletion if event is completed or has participants
        if (event.status === 'COMPLETED' || event.currentRegistrations > 0) {
            return next(new ErrorResponse('Cannot delete event with participants or completed events', 400));
        }

        await Event.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve event
// @route   PUT /api/events/:id/approve
// @access  Private/Admin
exports.approveEvent = async (req, res, next) => {
    try {
        const { adminRemarks } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return next(new ErrorResponse('Event not found', 404));
        }

        // Check permissions - Admin can approve events based on eligibility, not department
        // No department restriction - admins can approve events they are eligible for

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            {
                status: 'APPROVED',
                approvedBy: req.user.email,
                approvedAt: new Date(),
                adminRemarks
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedEvent,
            message: 'Event approved successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject event
// @route   PUT /api/events/:id/reject
// @access  Private/Admin
exports.rejectEvent = async (req, res, next) => {
    try {
        const { adminRemarks } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return next(new ErrorResponse('Event not found', 404));
        }

        // Check permissions - Admin can reject events based on eligibility, not department
        // No department restriction - admins can reject events they are eligible for

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            {
                status: 'REJECTED',
                rejectedBy: req.user.email,
                rejectedAt: new Date(),
                adminRemarks
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedEvent,
            message: 'Event rejected successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get event registrations
// @route   GET /api/events/:id/registrations
// @access  Private
exports.getEventRegistrations = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return next(new ErrorResponse('Event not found', 404));
        }

        // Check permissions
        if (req.user.role === 'ORGANIZER' && event.organizerEmail !== req.user.email) {
            return next(new ErrorResponse('Not authorized to view registrations for this event', 403));
        }

        if (req.user.role === 'ADMIN' && event.organizerDepartment !== req.user.department) {
            return next(new ErrorResponse('Not authorized to view registrations for this event', 403));
        }

        const registrations = await Registration.find({ eventId: req.params.id })
            .sort({ registrationDate: -1 });

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: registrations
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private/Student
exports.registerForEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return next(new ErrorResponse('Event not found', 404));
        }

        if (event.status !== 'APPROVED') {
            return next(new ErrorResponse('Event is not open for registration', 400));
        }

        if (event.currentRegistrations >= event.maxParticipants) {
            return next(new ErrorResponse('Event is full', 400));
        }

        if (new Date() > new Date(event.registrationDeadline)) {
            return next(new ErrorResponse('Registration deadline has passed', 400));
        }

        // Check if already registered
        const existingRegistration = await Registration.findOne({
            eventId: req.params.id,
            studentEmail: req.user.email
        });

        if (existingRegistration) {
            return next(new ErrorResponse('Already registered for this event', 400));
        }

        const registration = await Registration.create({
            eventId: req.params.id,
            studentEmail: req.user.email,
            studentName: req.user.name,
            studentDepartment: req.user.department,
            studentYear: req.user.year
        });

        // Update event registration count
        await Event.findByIdAndUpdate(req.params.id, {
            $inc: { currentRegistrations: 1 },
            $push: { registeredParticipants: req.user.email }
        });

        res.status(201).json({
            success: true,
            data: registration,
            message: 'Registration successful'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current student's registrations
// @route   GET /api/events/registrations/me
// @access  Private/Student
exports.getMyRegistrations = async (req, res, next) => {
    try {
        const registrations = await Registration.find({ studentEmail: req.user.email })
            .populate('eventId')
            .sort({ registrationDate: -1 });

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: registrations
        });
    } catch (error) {
        next(error);
    }
};
