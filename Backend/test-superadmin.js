const mongoose = require('mongoose');
const User = require('./models/User');
const { getDashboardStats } = require('./controllers/superadmin.controller');

// Mock request and response objects
const mockRequest = (user = {}) => ({
    user: {
        id: 'test-super-admin-id',
        role: 'SUPER_ADMIN',
        ...user
    }
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Mock next function
const next = jest.fn();

describe('Super Admin Dashboard', () => {
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('getDashboardStats', () => {
        it('should return dashboard statistics', async () => {
            // Create test users
            await User.create([
                { name: 'Admin 1', email: 'admin1@test.com', password: 'password', role: 'ADMIN', status: 'ACTIVE' },
                { name: 'Organizer 1', email: 'org1@test.com', password: 'password', role: 'ORGANIZER', status: 'PENDING' },
                { name: 'Student 1', email: 'student1@test.com', password: 'password', role: 'STUDENT', status: 'ACTIVE' },
            ]);

            const req = mockRequest();
            const res = mockResponse();

            await getDashboardStats(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    totalUsers: expect.any(Number),
                    activeUsers: expect.any(Number),
                    pendingApprovals: expect.any(Number),
                    roleWiseUserCount: expect.any(Object)
                }
            });
        });
    });
});
