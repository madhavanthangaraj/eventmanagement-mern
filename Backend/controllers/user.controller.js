// backend/controllers/user.controller.js
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Update user status
// @route   PUT /api/users/status/:id
// @access  Private/Admin
exports.updateUserStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;

  // Validate status
  if (!['ACTIVE', 'INACTIVE', 'PENDING'].includes(status)) {
    return next(new ErrorResponse('Invalid status value', 400));
  }

  // Find user and update status
  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');
  
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});