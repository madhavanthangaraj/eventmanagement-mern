const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { generateToken } = require('../utils/jwtUtils');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    const { name, email, password, role, department, year } = req.body;

    try {
        console.log('Registration attempt:', { name, email, role, department, year }); // Debug log
        
        // Check if role is allowed for registration
        if (['ADMIN', 'SUPER_ADMIN'].includes(role)) {
            return next(new ErrorResponse('Invalid role for registration', 400));
        }

        // Create user with appropriate status
        const userData = {
            name,
            email,
            password,
            role,
            department,
            year: role === 'STUDENT' ? year : undefined,
            status: role === 'ORGANIZER' ? 'ACTIVE' : 'INACTIVE' // Organizers are auto-approved
        };
        
        console.log('Creating user with data:', userData);
        const user = await User.create(userData);
        console.log('User created with status:', user.status);

        // Force update status for organizers if not set correctly
        if (role === 'ORGANIZER' && user.status !== 'ACTIVE') {
            user.status = 'ACTIVE';
            await user.save();
            console.log('Updated organizer status to ACTIVE');
        }

        console.log('User created successfully:', user.email); // Debug log

        // Don't send password in response
        user.password = undefined;

        // Generate token for organizers since they're auto-approved
        let token = null;
        if (role === 'ORGANIZER') {
            token = generateToken(user);
        }

        res.status(201).json({
            success: true,
            message: role === 'ORGANIZER' ? 'Registration successful!' : 'Registration successful. Waiting for Super Admin approval.',
            data: user,
            ...(token && { token })
        });
    } catch (error) {
        console.error('Registration error:', error); // Debug log
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// In auth.controller.js
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        // Direct super admin login
        if (normalizedEmail === 'superadmin@gmail.com' && password === 'Super@2026') {
            const user = await User.findOne({ email: 'superadmin@gmail.com' });
            
            if (!user) {
                // Create super admin if not exists
                const newUser = await User.create({
                    name: 'Super Admin',
                    email: 'superadmin@gmail.com',
                    password: 'Super@2026',
                    role: 'SUPER_ADMIN',
                    status: 'ACTIVE'
                });
                
                const token = generateToken(newUser);
                return res.json({
                    success: true,
                    token,
                    user: {
                        id: newUser._id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role
                    }
                });
            }

            const token = generateToken(user);
            return res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }

        // Regular user login
        const user = await User.findOne({ email: normalizedEmail }).select('+password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check if user is approved
        if (user.status !== 'ACTIVE') {
            return res.status(401).json({ 
                success: false, 
                message: 'Your account is not active. Please contact administrator.' 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Generate token
        const token = generateToken(user);
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                department: user.department,
                year: user.year
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};