require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const superadminRoutes = require('./routes/superadmin.routes');
const { createSuperAdmin } = require('./utils/initialSetup');
const userRoutes = require('./routes/user.routes');
const eventRoutes = require('./routes/event.routes');
const organizerRoutes = require('./routes/organizer.routes');
const adminEventRoutes = require('./routes/adminEvent.routes');
const healthRoutes = require('./routes/health.routes');
const studentRoutes = require('./routes/student.routes');
const mentorRoutes = require('./routes/mentor.routes');

const app = express();

// CORS Configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5000'], // Frontend URLs
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    // Add more explicit CORS headers
    exposedHeaders: ['X-Total-Count', 'X-Content-Type-Options', 'X-Requested-With'],
    optionsSuccessStatus: 200, // Send 200 for OPTIONS requests
    preflightContinue: false
};

// Custom CORS middleware for preflight requests
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const method = req.method;
    
    // Handle preflight OPTIONS requests
    if (method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '86400');
        res.status(200).end();
        return;
    }
    
    // Add CORS headers to all other requests
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors(corsOptions));
app.use(express.json());

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });
        console.log('Connected to MongoDB');
        // Create super admin if not exists
        await createSuperAdmin();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin/events', adminEventRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/health', healthRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', err); // Log actual error
    console.error('Error stack:', err.stack);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ 
            success: false, 
            message: 'Validation failed', 
            errors 
        });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email already exists' 
        });
    }
    
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
    
    // Handle other errors
    res.status(err.statusCode || 500).json({ 
        success: false, 
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
