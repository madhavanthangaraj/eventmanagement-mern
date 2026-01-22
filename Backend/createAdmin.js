const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function createSuperAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Check if super admin already exists
        const existingAdmin = await User.findOne({ email: 'superadmin@gmail.com' });
        if (existingAdmin) {
            console.log('Super admin already exists, updating...');
            // Update existing admin
            const salt = await bcrypt.genSalt(10);
            existingAdmin.password = await bcrypt.hash('Super@2026', salt);
            existingAdmin.role = 'SUPER_ADMIN';
            existingAdmin.status = 'ACTIVE';
            existingAdmin.department = 'CSE';
            existingAdmin.year = 1;
            await existingAdmin.save();
            console.log('Super admin updated successfully');
        } else {
            // Create new super admin
            const salt = await bcrypt.genSalt(10);
            const user = new User({
                name: 'Super Admin',
                email: 'superadmin@gmail.com',
                password: await bcrypt.hash('Super@2026', salt),
                role: 'SUPER_ADMIN',
                status: 'ACTIVE',
                department: 'CSE',
                year: 1
            });
            await user.save();
            console.log('Super admin created successfully');
        }

        console.log('Super admin credentials:');
        console.log('Email: superadmin@gmail.com');
        console.log('Password: Super@2026');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating super admin:', error);
        process.exit(1);
    }
}

createSuperAdmin();
