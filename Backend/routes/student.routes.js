const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  submitProof,
  getStudentReports,
  getStudentCredits
} = require('../controllers/student.controller');

// Protect all routes
router.use(protect);
router.use(authorize('STUDENT'));

// Routes
router.route('/submit-proof')
  .post(submitProof);

router.route('/reports')
  .get(getStudentReports);

router.route('/credits')
  .get(getStudentCredits);

module.exports = router;
