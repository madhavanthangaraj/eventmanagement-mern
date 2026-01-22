const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
    try {
        console.log('🔍 Checking for existing Super Admin...');
        
        // Check if super admin already exists
        const existingAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
        
        if (existingAdmin) {
            console.log('✅ Super Admin already exists');
            console.log('📧 Email:', existingAdmin.email);
            return;
        }

        console.log('🔑 Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, salt);
        
        console.log('👤 Creating new Super Admin...');
        const superAdmin = new User({
            name: 'Super Admin',
            email: process.env.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            department: null,
            status: 'ACTIVE'
        });

        await superAdmin.save();
        console.log('✅ Super Admin created successfully');
        console.log('-----------------------------------');
        console.log('🔐 SUPER ADMIN CREDENTIALS');
        console.log(`📧 Email: ${process.env.SUPER_ADMIN_EMAIL}`);
        console.log(`🔑 Password: ${process.env.SUPER_ADMIN_PASSWORD}`);
        console.log('-----------------------------------');
        
    } catch (error) {
        console.error('\n❌ ERROR CREATING SUPER ADMIN');
        console.error('----------------------------');
        
        // Handle the error object that might be returned instead of thrown
        const actualError = error.message ? error : new Error('Unknown error occurred');
        
        console.error('Error details:', {
            name: actualError.name || 'Error',
            message: actualError.message,
            code: actualError.code,
            stack: actualError.stack
        });
        
        if (actualError.code === 11000) {
            console.log('\nℹ️  Super Admin already exists in the database');
            return; // This is not really an error, just info
        }
    }
}

module.exports = {
    createSuperAdmin
};
