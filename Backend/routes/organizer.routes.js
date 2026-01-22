const express = require('express');
const router = express.Router();
const organizerController = require('../controllers/organizer.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Get organizer dashboard stats
router.get(
    '/dashboard',
    protect,
    authorize(['ORGANIZER']),
    organizerController.getDashboardStats
);

// Get all organizer events
router.get(
    '/events',
    protect,
    authorize(['ORGANIZER']),
    organizerController.getOrganizerEvents
);

// Get organizer registrations
router.get(
    '/registrations',
    protect,
    authorize(['ORGANIZER']),
    organizerController.getOrganizerRegistrations
);

// Get organizer proofs
router.get(
    '/proofs',
    protect,
    authorize(['ORGANIZER']),
    organizerController.getOrganizerProofs
);

// Get organizer credits
router.get(
    '/credits',
    protect,
    authorize(['ORGANIZER']),
    organizerController.getOrganizerCredits
);

module.exports = router;
