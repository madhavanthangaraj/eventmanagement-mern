const mongoose = require('mongoose');
require('dotenv').config();

async function testDashboardQuery() {
    try {
        // Connect to the database
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
        console.log('✅ Connected to MongoDB');

        // Test the aggregation query
        const result = await mongoose.connection.db.collection('users').aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        console.log('🔍 Aggregation result:');
        console.log(JSON.stringify(result, null, 2));

        // Get user counts
        const totalUsers = await mongoose.connection.db.collection('users').countDocuments();
        const activeUsers = await mongoose.connection.db.collection('users').countDocuments({ status: 'ACTIVE' });
        const pendingApprovals = await mongoose.connection.db.collection('users').countDocuments({ status: 'PENDING' });

        console.log('\n📊 User Counts:');
        console.log(`Total Users: ${totalUsers}`);
        console.log(`Active Users: ${activeUsers}`);
        console.log(`Pending Approvals: ${pendingApprovals}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

testDashboardQuery();
