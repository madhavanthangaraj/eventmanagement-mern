const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
    verifyProof,
    rejectProof,
    getMentorProofs
} = require('../controllers/mentor.controller');

// Protect all routes
router.use(protect);
router.use(authorize(['MENTOR', 'ADMIN']));

// Routes
router.route('/proofs')
    .get(getMentorProofs);

router.route('/verify-proof/:proofId')
    .put(verifyProof);

router.route('/reject-proof/:proofId')
    .put(rejectProof);

module.exports = router;
