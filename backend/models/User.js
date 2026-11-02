// 1. Imports
import mongoose from 'mongoose';

// 2. User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    profilePicture: {
        type: String,
        default: ''
    },

    isOnline: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// 3. Model
const User = mongoose.model('User', userSchema);

// 4. Export
export default User;