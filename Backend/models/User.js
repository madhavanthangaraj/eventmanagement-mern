const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'ADMIN', 'ORGANIZER', 'MENTOR', 'STUDENT'],
        required: [true, 'Role is required']
    },
    department: {
        type: String,
        enum: ['CSE', 'EEE', 'ECE', 'IT', 'CCE', 'CSBS', null],
        default: null,
        validate: {
            validator: function(v) {
                // Department is required for all roles except SUPER_ADMIN
                if (this.role === 'SUPER_ADMIN') return true;
                return ['ADMIN', 'ORGANIZER', 'MENTOR', 'STUDENT'].includes(this.role) && v !== null;
            },
            message: 'Department is required for this role'
        }
    },
    year: {
        type: Number,
        min: 1,
        max: 4,
        validate: {
            validator: function(v) {
                // Year is required only for students
                if (this.role === 'STUDENT') return v >= 1 && v <= 4;
                return true;
            },
            message: 'Year is required for students (1-4)'
        }
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'REJECTED'],
        default: 'INACTIVE'
    }
}, {
    timestamps: true
});

// Hash password before saving - using async/await without next
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw new Error('Error hashing password');
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Handle duplicate email error
userSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('Email already exists'));
    } else {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
