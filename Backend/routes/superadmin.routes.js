const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
    getDashboardStats,
    getUsers,
    approveUser,
    rejectUser,
    toggleUserStatus,
    assignRole
} = require('../controllers/superadmin.controller');

// All routes are protected
router.use(protect);

// Dashboard routes - SUPER_ADMIN only
router.get('/dashboard-stats', authorize('SUPER_ADMIN'), getDashboardStats);

// User management routes - SUPER_ADMIN only
router.get('/users', authorize('SUPER_ADMIN'), getUsers);
router.put('/approve-user/:userId', authorize('SUPER_ADMIN'), approveUser);
router.put('/reject-user/:userId', authorize('SUPER_ADMIN'), rejectUser);
router.put('/toggle-status/:userId', authorize('SUPER_ADMIN'), toggleUserStatus);
router.put('/assign-role/:userId', authorize('SUPER_ADMIN'), assignRole);

module.exports = router;
