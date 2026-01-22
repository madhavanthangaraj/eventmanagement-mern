// backend/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getUsers,
  updateUserStatus
} = require('../controllers/user.controller');

// Protect all routes
router.use(protect);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

// Routes
router.route('/')
  .get(getUsers);

router.route('/status/:id')
  .put(updateUserStatus);

module.exports = router;