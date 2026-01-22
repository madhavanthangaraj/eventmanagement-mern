const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });

    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('✅ Super admin already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('Status:', existingAdmin.status);
      process.exit(0);
    }

    console.log('Creating super admin...');
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, salt);

    // Create super admin
    const superAdmin = new User({
      name: 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      department: null, // SUPER_ADMIN doesn't require department
      year: null       // SUPER_ADMIN doesn't require year
    });

    await superAdmin.save();
    console.log('✅ Super admin created successfully');
    console.log('Email:', superAdmin.email);
    console.log('Role:', superAdmin.role);
    console.log('Status:', superAdmin.status);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding super admin:');
    console.error(error.message);
    if (error.errors) {
      Object.values(error.errors).forEach(err => {
        console.error(`- ${err.message}`);
      });
    }
    process.exit(1);
  }
};

seedSuperAdmin();
