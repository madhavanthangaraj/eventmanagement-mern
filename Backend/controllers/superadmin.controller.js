const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get dashboard statistics
// @route   GET /api/superadmin/dashboard-stats
// @access  Private/SUPER_ADMIN
exports.getDashboardStats = async (req, res, next) => {
    console.log('getDashboardStats called'); // Debug log
    try {
        console.log('Starting database queries...'); // Debug log
        
        const totalUsers = await User.countDocuments();
        console.log('Total users:', totalUsers); // Debug log

        const activeUsers = await User.countDocuments({ status: 'ACTIVE' });
        console.log('Active users:', activeUsers); // Debug log

        const pendingApprovals = await User.countDocuments({ status: 'PENDING' });
        console.log('Pending approvals:', pendingApprovals); // Debug log

        let roleCounts = [];
        try {
            roleCounts = await User.aggregate([
                { $match: {} },
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]);
            console.log('Role counts:', JSON.stringify(roleCounts)); // Debug log
        } catch (aggError) {
            console.error('Aggregation error:', aggError); // Debug log
            throw aggError;
        }

        // Convert role counts array to object
        const roleWiseUserCount = roleCounts.reduce((acc, { _id, count }) => {
            acc[_id] = count;
            return acc;
        }, {});

        console.log('Sending response...'); // Debug log
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                pendingApprovals,
                roleWiseUserCount
            }
        });
    } catch (error) {
        console.error('Error in getDashboardStats:', error); // Debug log
        next(error);
    }
};

// @desc    Get all users with filters
// @route   GET /api/superadmin/users
// @access  Private/SUPER_ADMIN
exports.getUsers = async (req, res, next) => {
    try {
        const { role, status } = req.query;
        
        // Build query
        const query = {};
        if (role) query.role = role;
        if (status) query.status = status;

        const users = await User.find(query).select('-password');
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve a user
// @route   PUT /api/superadmin/approve-user/:userId
// @access  Private/SUPER_ADMIN
exports.approveUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { status: 'ACTIVE' },
            { new: true, runValidators: true }
        );

        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.userId}`, 404));
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject a user
// @route   PUT /api/superadmin/reject-user/:userId
// @access  Private/SUPER_ADMIN
exports.rejectUser = async (req, res, next) => {
    try {
        console.log('Rejecting user with ID:', req.params.userId); // Debug log
        
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { status: 'REJECTED' },
            { new: true, runValidators: true }
        );

        console.log('Updated user:', user); // Debug log

        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.userId}`, 404));
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error in rejectUser:', error); // Debug log
        next(error);
    }
};

// @desc    Toggle user status
// @route   PUT /api/superadmin/toggle-status/:userId
// @access  Private/SUPER_ADMIN
exports.toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.userId}`, 404));
        }

        // Toggle between ACTIVE and INACTIVE (but not PENDING)
        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        
        user.status = newStatus;
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Assign role to user
// @route   PUT /api/superadmin/assign-role/:userId
// @access  Private/SUPER_ADMIN
exports.assignRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        
        if (!['ADMIN', 'ORGANIZER', 'MENTOR', 'STUDENT'].includes(role)) {
            return next(new ErrorResponse('Invalid role specified', 400));
        }

        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.userId}`, 404));
        }

        user.role = role;

        // Ensure required fields are set for non-superadmin roles
        if (user.role !== 'SUPER_ADMIN' && (user.department === null || user.department === undefined)) {
            user.department = 'CSE';
        }

        // STUDENT requires valid year (schema validator fails for undefined)
        if (user.role === 'STUDENT') {
            if (user.year === null || user.year === undefined || user.year < 1 || user.year > 4) {
                user.year = 1;
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};
