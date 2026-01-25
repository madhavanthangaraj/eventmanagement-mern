const AdminEvent = require('../models/AdminEvent');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new admin event
// @route   POST /api/admin/events
// @access  Private/Admin
exports.createAdminEvent = async (req, res, next) => {
    try {
        const eventData = {
            ...req.body,
            createdBy: req.user.email,
            createdByName: req.user.name,
            createdByDepartment: req.user.department,
            // Ensure eligibility is an array
            eligibility: Array.isArray(req.body.eligibility) 
                ? req.body.eligibility 
                : req.body.eligibility.split(',').map(s => s.trim()).filter(Boolean)
        };

        const adminEvent = await AdminEvent.create(eventData);

        // Auto-approve admin events
        adminEvent.status = 'APPROVED';
        adminEvent.approvedBy = req.user.email;
        adminEvent.approvedAt = new Date();
        await adminEvent.save();

        res.status(201).json({
            success: true,
            data: adminEvent,
            message: 'Admin event created successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all admin events (filtered by department for regular admins)
// @route   GET /api/admin/events
// @access  Private/Admin
exports.getAdminEvents = async (req, res, next) => {
    try {
        let query = {};
        
        // If user is ADMIN (not SUPER_ADMIN), only show events from their department
        if (req.user.role === 'ADMIN') {
            query.createdByDepartment = req.user.department;
        }
        
        const adminEvents = await AdminEvent.find(query)
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: adminEvents.length,
            data: adminEvents
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single admin event
// @route   GET /api/admin/events/:id
// @access  Private/Admin
exports.getAdminEvent = async (req, res, next) => {
    try {
        const adminEvent = await AdminEvent.findById(req.params.id);
        
        if (!adminEvent) {
            return next(new ErrorResponse('Admin event not found', 404));
        }
        
        // Check if admin has permission to view this event
        if (req.user.role === 'ADMIN' && adminEvent.createdByDepartment !== req.user.department) {
            return next(new ErrorResponse('Not authorized to view this event', 403));
        }
        
        res.status(200).json({
            success: true,
            data: adminEvent
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update admin event
// @route   PUT /api/admin/events/:id
// @access  Private/Admin
exports.updateAdminEvent = async (req, res, next) => {
    try {
        let adminEvent = await AdminEvent.findById(req.params.id);
        
        if (!adminEvent) {
            return next(new ErrorResponse('Admin event not found', 404));
        }
        
        // Check if admin has permission to update this event
        if (req.user.role === 'ADMIN' && adminEvent.createdByDepartment !== req.user.department) {
            return next(new ErrorResponse('Not authorized to update this event', 403));
        }
        
        // Prevent updating completed or cancelled events
        if (adminEvent.status === 'COMPLETED' || adminEvent.status === 'CANCELLED') {
            return next(new ErrorResponse('Cannot update completed or cancelled events', 400));
        }
        
        // Update fields
        const updateData = { ...req.body };
        
        // Handle eligibility conversion
        if (updateData.eligibility) {
            updateData.eligibility = Array.isArray(updateData.eligibility) 
                ? updateData.eligibility 
                : updateData.eligibility.split(',').map(s => s.trim()).filter(Boolean);
        }
        
        const updatedAdminEvent = await AdminEvent.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            data: updatedAdminEvent,
            message: 'Admin event updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete admin event
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
exports.deleteAdminEvent = async (req, res, next) => {
    try {
        const adminEvent = await AdminEvent.findById(req.params.id);
        
        if (!adminEvent) {
            return next(new ErrorResponse('Admin event not found', 404));
        }
        
        // Check if admin has permission to delete this event
        if (req.user.role === 'ADMIN' && adminEvent.createdByDepartment !== req.user.department) {
            return next(new ErrorResponse('Not authorized to delete this event', 403));
        }
        
        // Prevent deleting events with participants
        if (adminEvent.registeredParticipants && adminEvent.registeredParticipants.length > 0) {
            return next(new ErrorResponse('Cannot delete event with registered participants', 400));
        }
        
        // Prevent deleting completed or cancelled events
        if (adminEvent.status === 'COMPLETED' || adminEvent.status === 'CANCELLED') {
            return next(new ErrorResponse('Cannot delete completed or cancelled events', 400));
        }
        
        await adminEvent.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Admin event deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get admin events by department (for public view)
// @route   GET /api/admin/events/department/:department
// @access  Public
exports.getAdminEventsByDepartment = async (req, res, next) => {
    try {
        const { department } = req.params;
        
        const adminEvents = await AdminEvent.find({
            createdByDepartment: department,
            status: 'APPROVED'
        })
        .select('-registeredParticipants -adminRemarks -approvedBy -rejectedBy')
        .sort({ startDate: 1 });
        
        res.status(200).json({
            success: true,
            count: adminEvents.length,
            data: adminEvents
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Register for admin event
// @route   POST /api/admin/events/:id/register
// @access  Private
exports.registerForAdminEvent = async (req, res, next) => {
    try {
        const adminEvent = await AdminEvent.findById(req.params.id);
        
        if (!adminEvent) {
            return next(new ErrorResponse('Admin event not found', 404));
        }
        
        // Check if event is approved
        if (adminEvent.status !== 'APPROVED') {
            return next(new ErrorResponse('Event is not available for registration', 400));
        }
        
        // Check if registration is still open
        if (new Date() > new Date(adminEvent.registrationDeadline)) {
            return next(new ErrorResponse('Registration deadline has passed', 400));
        }
        
        // Check if event is full
        if (adminEvent.currentRegistrations >= adminEvent.maxParticipants) {
            return next(new ErrorResponse('Event is full', 400));
        }
        
        // Check if user is already registered
        if (adminEvent.registeredParticipants.includes(req.user.email)) {
            return next(new ErrorResponse('Already registered for this event', 400));
        }
        
        // Check user eligibility
        if (!adminEvent.eligibility.includes(req.user.department)) {
            return next(new ErrorResponse('You are not eligible for this event', 400));
        }
        
        // Add user to registered participants
        adminEvent.registeredParticipants.push(req.user.email);
        adminEvent.currentRegistrations += 1;
        await adminEvent.save();
        
        res.status(200).json({
            success: true,
            message: 'Successfully registered for the event',
            data: {
                eventId: adminEvent._id,
                eventTitle: adminEvent.eventTitle,
                currentRegistrations: adminEvent.currentRegistrations,
                maxParticipants: adminEvent.maxParticipants
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get admin event statistics
// @route   GET /api/admin/events/stats
// @access  Private/Admin
exports.getAdminEventStats = async (req, res, next) => {
    try {
        let matchQuery = {};
        
        // If user is ADMIN (not SUPER_ADMIN), only show stats for their department
        if (req.user.role === 'ADMIN') {
            matchQuery.createdByDepartment = req.user.department;
        }
        
        const stats = await AdminEvent.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalEvents: { $sum: 1 },
                    approvedEvents: {
                        $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] }
                    },
                    pendingEvents: {
                        $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] }
                    },
                    completedEvents: {
                        $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                    },
                    cancelledEvents: {
                        $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] }
                    },
                    totalRegistrations: { $sum: '$currentRegistrations' },
                    upcomingEvents: {
                        $sum: {
                            $cond: [{ $gt: ['$startDate', new Date()] }, 1, 0]
                        }
                    }
                }
            }
        ]);
        
        const categoryStats = await AdminEvent.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                ...(stats[0] || {
                    totalEvents: 0,
                    approvedEvents: 0,
                    pendingEvents: 0,
                    completedEvents: 0,
                    cancelledEvents: 0,
                    totalRegistrations: 0,
                    upcomingEvents: 0
                }),
                categoryDistribution: categoryStats.reduce((acc, { _id, count }) => {
                    acc[_id] = count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        next(error);
    }
};
