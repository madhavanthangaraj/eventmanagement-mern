const express = require('express');
const router = express.Router();
const {
    createAdminEvent,
    getAdminEvents,
    getAdminEvent,
    updateAdminEvent,
    deleteAdminEvent,
    getAdminEventsByDepartment,
    registerForAdminEvent,
    getAdminEventStats
} = require('../controllers/adminEvent.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Admin event management routes
router.post(
    '/',
    protect,
    authorize(['ADMIN', 'SUPER_ADMIN']),
    createAdminEvent
);

router.get(
    '/',
    protect,
    authorize(['ADMIN', 'SUPER_ADMIN']),
    getAdminEvents
);

router.get(
    '/stats',
    protect,
    authorize(['ADMIN', 'SUPER_ADMIN']),
    getAdminEventStats
);

router.get(
    '/:id',
    protect,
    authorize(['ADMIN', 'SUPER_ADMIN']),
    getAdminEvent
);

router.put(
    '/:id',
    protect,
    authorize(['ADMIN', 'SUPER_ADMIN']),
    updateAdminEvent
);

router.delete(
    '/:id',
    protect,
    authorize(['ADMIN', 'SUPER_ADMIN']),
    deleteAdminEvent
);

// Public routes
router.get(
    '/department/:department',
    getAdminEventsByDepartment
);

// Registration route (authenticated users)
router.post(
    '/:id/register',
    protect,
    authorize(['STUDENT', 'ORGANIZER', 'MENTOR']),
    registerForAdminEvent
);

module.exports = router;
