const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { verifyToken } = require('../utils/jwtUtils');

exports.protect = async (req, res, next) => {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookie
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route - No token provided', 401));
    }

    try {
        // Verify token
        const decoded = verifyToken(token);
        console.log('Token decoded:', decoded);
        console.log('Token user ID:', decoded.id);
        
        // Get user from the token
        req.user = await User.findById(decoded.id).select('-password');
        console.log('User from DB:', JSON.stringify(req.user, null, 2));
        console.log('User role from DB:', req.user.role);
        console.log('User role type:', typeof req.user.role);
        console.log('User role length:', req.user.role ? req.user.role.length : 'undefined');
        
        if (!req.user) {
            return next(new ErrorResponse('User not found', 404));
        }

        // Check if user is active
        if (req.user.status !== 'ACTIVE' && req.user.role !== 'SUPER_ADMIN') {
            return next(new ErrorResponse('Account is not active', 401));
        }

        next();
    } catch (error) {
        console.error('Auth Error:', error);
        return next(new ErrorResponse('Not authorized to access this route - Invalid token', 401));
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        console.log('Authorization check - User role:', JSON.stringify(req.user.role));
        console.log('Authorization check - Raw roles received:', roles);
        
        // Handle the case where roles might be passed as a single array
        let allowedRoles = [];
        if (roles.length === 1 && Array.isArray(roles[0])) {
            // If first argument is an array, use it directly
            allowedRoles = roles[0];
        } else {
            // Otherwise, flatten all arguments
            roles.forEach(role => {
                if (Array.isArray(role)) {
                    allowedRoles.push(...role);
                } else {
                    allowedRoles.push(role);
                }
            });
        }
        
        console.log('Final allowed roles:', allowedRoles);
        
        // Convert to simple array of trimmed strings
        const normalizedRoles = allowedRoles.map(role => {
            if (typeof role === 'string') {
                return role.trim();
            }
            return String(role).trim();
        });
        
        // Check if user role exists and is string
        if (!req.user.role || typeof req.user.role !== 'string') {
            return next(
                new ErrorResponse('User role is not properly defined', 403)
            );
        }
        
        // Normalize both sides for comparison
        const normalizedUserRole = req.user.role.trim().toUpperCase();
        const normalizedAllowedRoles = normalizedRoles.map(role => {
            if (typeof role === 'string') {
                return role.trim().toUpperCase();
            }
            return String(role).trim().toUpperCase();
        });
        
        console.log('Authorization check - Normalized user role:', normalizedUserRole);
        console.log('Authorization check - Normalized allowed roles:', normalizedAllowedRoles);
        console.log('Authorization check - Normalized comparison:', normalizedAllowedRoles.includes(normalizedUserRole));
        
        if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
            return next(
                new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403)
            );
        }
        next();
    };
};

exports.departmentCheck = (req, res, next) => {
    // Skip department check for SUPER_ADMIN
    if (req.user.role === 'SUPER_ADMIN') return next();
    
    // For ADMIN, check if they're accessing their own department's data
    if (req.user.role === 'ADMIN' && req.params.department !== req.user.department) {
        return next(
            new ErrorResponse(`Not authorized to access this department's data`, 403)
        );
    }
    
    next();
};
