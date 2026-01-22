// Test the authorize middleware directly
const { authorize } = require('./backend/middleware/auth.middleware');

// Mock req, res, next objects
const mockReq = {
    user: {
        role: 'ORGANIZER'
    }
};

const mockRes = {};
const mockNext = (error) => {
    if (error) {
        console.log('❌ Authorization failed:', error.message);
    } else {
        console.log('✅ Authorization successful');
    }
};

console.log('Testing authorize middleware...');

// Test the exact way it's called in the routes
const authMiddleware = authorize(['ORGANIZER', 'ADMIN']);

authMiddleware(mockReq, mockRes, mockNext);
