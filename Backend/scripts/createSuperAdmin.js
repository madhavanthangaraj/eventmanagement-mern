const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB...');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ email: 'superadmin@gmail.com' });
    
    if (existingAdmin) {
      console.log('Super admin already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Super@2026', salt);

    // Create super admin
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'superadmin@gmail.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    });

    await superAdmin.save();
    console.log('Super admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
