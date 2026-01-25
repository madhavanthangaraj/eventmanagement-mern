const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Super Admin routes
router.post(
    '/create-admin',
    protect,
    authorize('SUPER_ADMIN'),
    adminController.createAdmin
);

// Get all users (for admin dashboard)
router.get(
    '/users',
    protect,
    authorize(['SUPER_ADMIN', 'ADMIN', 'MENTOR']),
    adminController.getUsers
);

// Update user status (approve/reject)
router.put(
    '/users/:id/status',
    protect,
    authorize(['SUPER_ADMIN', 'ADMIN']),
    adminController.updateUserStatus
);

// Get all credits data
router.get(
    '/credits/all',
    protect,
    authorize(['SUPER_ADMIN', 'ADMIN']),
    adminController.getAllCredits
);

// Get credits for a specific student
router.get(
    '/credits/:studentEmail',
    protect,
    authorize(['SUPER_ADMIN', 'ADMIN']),
    adminController.getStudentCredits
);

// Get all proofs (admin accessible)
router.get(
    '/proofs',
    protect,
    authorize(['SUPER_ADMIN', 'ADMIN']),
    adminController.getAllProofs
);

// Test route to verify admin routes are working
router.get(
    '/test',
    (req, res) => {
        res.json({ message: 'Admin routes are working', user: req.user });
    }
);

module.exports = router;
