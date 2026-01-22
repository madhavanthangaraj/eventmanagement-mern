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
    authorize(['SUPER_ADMIN', 'ADMIN']),
    adminController.getUsers
);

// Update user status (approve/reject)
router.put(
    '/users/:id/status',
    protect,
    authorize(['SUPER_ADMIN', 'ADMIN']),
    adminController.updateUserStatus
);

module.exports = router;
