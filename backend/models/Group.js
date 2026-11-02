// 1. Imports
import mongoose from 'mongoose';

// 2. Group Schema
const groupSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },

    description: {
        type: String,
        default: ''
    },

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, {
    timestamps: true
});

// 3. Model
const Group = mongoose.model('Group', groupSchema);

// 4. Export
export default Group;