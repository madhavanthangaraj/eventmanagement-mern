const Proof = require('../models/Proof');
const Registration = require('../models/Registration');
const Credit = require('../models/Credit');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Verify proof and award credits
// @route   PUT /api/mentor/verify-proof/:proofId
// @access  Private/Mentor
exports.verifyProof = async (req, res, next) => {
    try {
        const { remarks, creditPoints: customCredits } = req.body;
        const { proofId } = req.params;

        // Get proof details
        const proof = await Proof.findById(proofId);
        if (!proof) {
            return next(new ErrorResponse('Proof not found', 404));
        }

        if (proof.status !== 'PENDING') {
            return next(new ErrorResponse('Proof has already been processed', 400));
        }

        // Use custom credits if provided, otherwise use default credits
        const creditsToAward = customCredits !== undefined ? customCredits : proof.creditPoints;

        // Update proof status with actual awarded credits
        const updatedProof = await Proof.findByIdAndUpdate(
            proofId,
            {
                status: 'VERIFIED',
                verifiedAt: new Date(),
                verifiedBy: req.user.email,
                mentorRemarks: remarks || '',
                creditPoints: creditsToAward, // Store the actual awarded credits
            },
            { new: true }
        );

        // Award credits to student registration
        await Registration.findOneAndUpdate(
            {
                eventId: proof.eventId,
                studentEmail: proof.studentEmail
            },
            {
                credits: creditsToAward,
                creditAwardedAt: new Date(),
                creditAwardedBy: req.user.email
            }
        );

        // Create credit record
        try {
            await Credit.create({
                studentEmail: proof.studentEmail,
                studentName: proof.studentName,
                eventId: proof.eventId,
                eventName: proof.eventName,
                creditPoints: creditsToAward,
                awardedAt: new Date(),
                awardedBy: req.user.email,
                proofId: proof._id
            });
        } catch (creditError) {
            // Log credit creation error but don't fail the verification
            console.error('Error creating credit record:', creditError);
        }

        res.status(200).json({
            success: true,
            message: `Proof verified and ${creditsToAward} credits awarded to ${proof.studentName}`,
            data: updatedProof
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Reject proof
// @route   PUT /api/mentor/reject-proof/:proofId
// @access  Private/Mentor
exports.rejectProof = async (req, res, next) => {
    try {
        const { remarks } = req.body;
        const { proofId } = req.params;

        if (!remarks || remarks.trim() === '') {
            return next(new ErrorResponse('Remarks are required for rejection', 400));
        }

        // Get proof details
        const proof = await Proof.findById(proofId);
        if (!proof) {
            return next(new ErrorResponse('Proof not found', 404));
        }

        if (proof.status !== 'PENDING') {
            return next(new ErrorResponse('Proof has already been processed', 400));
        }

        // Update proof status
        const updatedProof = await Proof.findByIdAndUpdate(
            proofId,
            {
                status: 'REJECTED',
                rejectedAt: new Date(),
                rejectedBy: req.user.email,
                mentorRemarks: remarks
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: `Proof rejected for ${proof.studentName}`,
            data: updatedProof
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all proofs for mentor's department
// @route   GET /api/mentor/proofs
// @access  Private/Mentor
exports.getMentorProofs = async (req, res, next) => {
    try {
        // Get proofs for mentor's department students
        const proofs = await Proof.find({ studentDepartment: req.user.department })
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            count: proofs.length,
            data: proofs
        });

    } catch (error) {
        next(error);
    }
};
