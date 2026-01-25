const User = require('../models/User');
const Credit = require('../models/Credit');
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

// @desc    Get all credits data
// @route   GET /api/admin/credits
// @access  Private/Admin
exports.getAllCredits = async (req, res, next) => {
    try {
        console.log('getAllCredits called');
        console.log('User:', req.user);
        
        const Proof = require('../models/Proof');
        let query = { status: 'VERIFIED' }; // Only get verified proofs
        
        // If user is ADMIN (not SUPER_ADMIN), only show credits from their department
        if (req.user.role === 'ADMIN') {
            console.log('Filtering by department:', req.user.department);
            query.studentDepartment = req.user.department;
        }
        
        console.log('Query:', query);
        
        // Get all verified proofs with the query
        const proofs = await Proof.find(query)
            .populate('eventId', 'eventName category')
            .sort({ verifiedAt: -1 });
            
        console.log('Verified proofs found:', proofs.length);
        
        // Group proofs by student and calculate totals
        const proofsByStudent = {};
        
        proofs.forEach(proof => {
            const email = proof.studentEmail;
            if (!proofsByStudent[email]) {
                proofsByStudent[email] = {
                    studentEmail: email,
                    studentName: proof.studentName,
                    totalCredits: 0,
                    credits: []
                };
            }
            
            proofsByStudent[email].totalCredits += proof.creditPoints;
            proofsByStudent[email].credits.push({
                eventId: proof.eventId,
                eventName: proof.eventName,
                creditPoints: proof.creditPoints,
                awardedAt: proof.verifiedAt,
                awardedBy: proof.verifiedBy
            });
        });
        
        // Convert to array and add user information
        const studentsWithCredits = Object.values(proofsByStudent);
        
        // Get user details for each student
        for (let student of studentsWithCredits) {
            const user = await User.findOne({ email: student.studentEmail })
                .select('name email department year status role');
            if (user) {
                student.name = user.name;
                student.email = user.email;
                student.department = user.department;
                student.year = user.year;
                student.status = user.status;
                student.role = user.role;
            }
        }
        
        console.log('Final students with credits:', studentsWithCredits.length);
        
        res.status(200).json({
            success: true,
            count: studentsWithCredits.length,
            data: studentsWithCredits
        });
        
    } catch (error) {
        console.error('Error fetching credits:', error);
        next(error);
    }
};

// @desc    Get credits for a specific student
// @route   GET /api/admin/credits/:studentEmail
// @access  Private/Admin
exports.getStudentCredits = async (req, res, next) => {
    try {
        const { studentEmail } = req.params;
        
        console.log('Getting credits for student:', studentEmail);
        console.log('Request user:', req.user);
        
        // Validate admin access to this student's data
        if (req.user.role === 'ADMIN') {
            // Get student to verify they're in the same department
            const student = await User.findOne({ email: studentEmail });
            if (!student) {
                return next(new ErrorResponse('Student not found', 404));
            }
            
            if (student.department !== req.user.department) {
                return next(new ErrorResponse('Not authorized to access this student\'s data', 403));
            }
        }
        
        // Get credits from the Credit collection for the specific student
        const Credit = require('../models/Credit');
        const credits = await Credit.find({ studentEmail })
            .sort({ awardedAt: -1 });
            
        console.log('Credits found for student:', credits.length);
        
        // Calculate total credits
        const totalCredits = credits.reduce((total, credit) => total + credit.creditPoints, 0);
        
        res.status(200).json({
            success: true,
            count: credits.length,
            totalCredits,
            data: credits
        });
        
    } catch (error) {
        console.error('Error fetching student credits:', error);
        next(error);
    }
};

// @desc    Get all credits (admin accessible)
// @route   GET /api/admin/credits/all
// @access  Private/Admin
exports.getAllCredits = async (req, res, next) => {
    try {
        const Credit = require('../models/Credit');
        
        let query = {};
        
        // If user is ADMIN (not SUPER_ADMIN), only show credits for their department
        if (req.user.role === 'ADMIN') {
            // Get all students from admin's department
            const User = require('../models/User');
            const departmentStudents = await User.find({ 
                department: req.user.department,
                role: 'STUDENT'
            }).select('email');
            
            const studentEmails = departmentStudents.map(student => student.email);
            query.studentEmail = { $in: studentEmails };
        }
        
        const credits = await Credit.find(query)
            .sort({ awardedAt: -1 });
            
        res.status(200).json({
            success: true,
            count: credits.length,
            data: credits
        });

    } catch (error) {
        console.error('Error fetching all credits:', error);
        next(error);
    }
};

// @desc    Get all proofs (admin accessible)
// @route   GET /api/admin/proofs
// @access  Private/Admin
exports.getAllProofs = async (req, res, next) => {
    try {
        console.log('getAllProofs called by admin');
        console.log('User:', req.user);
        
        const Proof = require('../models/Proof');
        let query = {};
        
        // If user is ADMIN (not SUPER_ADMIN), only show proofs from their department
        if (req.user.role === 'ADMIN') {
            console.log('Filtering proofs by department:', req.user.department);
            query.studentDepartment = req.user.department;
        }
        
        console.log('Query:', query);
        
        // Get all proofs with the query
        const proofs = await Proof.find(query)
            .populate('eventId', 'eventName category')
            .sort({ submittedAt: -1 });
            
        console.log('Proofs found:', proofs.length);
        
        res.status(200).json({
            success: true,
            count: proofs.length,
            data: proofs
        });
        
    } catch (error) {
        console.error('Error fetching proofs:', error);
        next(error);
    }
};
