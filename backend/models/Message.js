// 1. Imports
import mongoose from 'mongoose';

// 2. Message Schema
const messageSchema = new mongoose.Schema({

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },

    messageType: {
        type: String,
        enum: ['private', 'group'],
        required: true
    },

    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: null
    }

}, {
    timestamps: true
});

// 3. Model
const Message = mongoose.model('Message', messageSchema);

// 4. Export
export default Message;