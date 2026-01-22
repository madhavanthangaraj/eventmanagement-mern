const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create admin (Super Admin only)
// @route   POST /api/superadmin/create-admin
// @access  Private/Super Admin
exports.createAdmin = async (req, res, next) => {
    const { name, email, password, department } = req.body;

    try {
        // Check if department is provided
        if (!department) {
            return next(new ErrorResponse('Department is required for admin', 400));
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorResponse('Email already in use', 400));
        }

        // Create admin user
        const admin = await User.create({
            name,
            email,
            password,
            role: 'ADMIN',
            department,
            status: 'ACTIVE' // Auto-approve admin accounts
        });

        // Don't send password in response
        admin.password = undefined;

        res.status(201).json({
            success: true,
            data: admin,
            message: 'Admin created successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (for admin dashboard)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        let query = {};
        
        // If user is ADMIN (not SUPER_ADMIN), only show users from their department
        if (req.user.role === 'ADMIN') {
            query.department = req.user.department;
        }
        
        // Exclude SUPER_ADMIN from the list
        query.role = { $ne: 'SUPER_ADMIN' };
        
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

// @desc    Update user status (approve/reject)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        
        // Validate status
        if (!['ACTIVE', 'INACTIVE', 'REJECTED'].includes(status)) {
            return next(new ErrorResponse('Invalid status', 400));
        }
        
        // Find user
        const user = await User.findById(id);
        
        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }
        
        // Check if admin has permission to update this user
        if (req.user.role === 'ADMIN' && user.department !== req.user.department) {
            return next(
                new ErrorResponse('Not authorized to update users from other departments', 403)
            );
        }
        
        // Prevent updating SUPER_ADMIN or other admins (for non-super admins)
        if (user.role === 'SUPER_ADMIN' || 
            (user.role === 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
            return next(
                new ErrorResponse('Not authorized to update this user', 403)
            );
        }
        
        // Update status
        user.status = status;
        await user.save();
        
        res.status(200).json({
            success: true,
            data: user,
            message: `User ${status.toLowerCase()} successfully`
        });
    } catch (error) {
        next(error);
    }
};
