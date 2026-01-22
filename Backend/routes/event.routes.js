const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Create event
router.post(
    '/',
    protect,
    authorize(['ORGANIZER', 'ADMIN']),
    eventController.createEvent
);

// Get all events
router.get(
    '/',
    protect,
    authorize(['ORGANIZER', 'ADMIN', 'SUPER_ADMIN']),
    eventController.getAllEvents
);

// Get single event
router.get(
    '/:id',
    protect,
    authorize(['ORGANIZER', 'ADMIN', 'SUPER_ADMIN']),
    eventController.getEventById
);

// Update event
router.put(
    '/:id',
    protect,
    authorize(['ORGANIZER']),
    eventController.updateEvent
);

// Delete event
router.delete(
    '/:id',
    protect,
    authorize(['ORGANIZER']),
    eventController.deleteEvent
);

// Approve event
router.put(
    '/:id/approve',
    protect,
    authorize(['ADMIN', 'SUPER_ADMIN']),
    eventController.approveEvent
);

// Reject event
router.put(
    '/:id/reject',
    protect,
    authorize(['ADMIN', 'SUPER_ADMIN']),
    eventController.rejectEvent
);

// Get event registrations
router.get(
    '/:id/registrations',
    protect,
    authorize(['ORGANIZER', 'ADMIN', 'SUPER_ADMIN']),
    eventController.getEventRegistrations
);

// Register for event (student route)
router.post(
    '/:id/register',
    protect,
    authorize(['STUDENT']),
    eventController.registerForEvent
);

module.exports = router;
