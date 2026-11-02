// 1. Imports
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Group from '../models/Group.js';
import Message from '../models/Message.js';

// 2. Socket Configuration
const initializeSocket = (server) => {

    // Socket.IO Server
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ['GET', 'POST']
        }
    });

    // 3. Socket Authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;

            next();

        } catch (error) {
            next(new Error('Invalid or expired token'));
        }
    });

    // 4. Socket Connections
    io.on('connection', async (socket) => {

    const userId = socket.user._id.toString();

    console.log(`${socket.user.username} connected`);

    // 1. Join personal room
    socket.join(`user:${userId}`);

    // 2. Join existing group rooms
    try {
        const groups = await Group.find({
            members: socket.user._id
        }).select('_id');

        groups.forEach((group) => {
            socket.join(`group:${group._id}`);
        });

    } catch (error) {
        console.error('Failed to join group rooms:', error.message);
    }

    // 3. Dynamically join newly created or selected groups
    socket.on('join_group', async (data, callback) => {
        try {
            const { groupId } = data || {};

            if (!groupId) {
                return callback?.({
                    success: false,
                    message: 'Group ID is required'
                });
            }

            const group = await Group.findOne({
                _id: groupId,
                members: socket.user._id
            });

            if (!group) {
                return callback?.({
                    success: false,
                    message: 'You are not a member of this group'
                });
            }

            socket.join(`group:${group._id}`);

            console.log(`${socket.user.username} joined group: ${group.name}`);

            callback?.({
                success: true,
                message: 'Joined group successfully'
            });

        } catch (error) {
            console.error('Join group error:', error.message);

            callback?.({
                success: false,
                message: 'Unable to join group'
            });
        }
    });

    // 4. Send Message
socket.on('send_message', async (data, callback) => {
    try {
        const {
            receiver,
            groupId,
            content,
            messageType
        } = data || {};

        // Validate message content
        if (!content || !content.trim()) {
            return callback?.({
                success: false,
                message: 'Message cannot be empty.'
            });
        }

        if (content.length > 5000) {
            return callback?.({
                success: false,
                message: 'Message is too long.'
            });
        }

        if (!['private', 'group'].includes(messageType)) {
            return callback?.({
                success: false,
                message: 'Invalid message type.'
            });
        }

        let messageData = {
            sender: socket.user._id,
            content: content.trim(),
            messageType
        };

        // Private message validation
        if (messageType === 'private') {
            if (!receiver || !mongoose.Types.ObjectId.isValid(receiver)) {
                return callback?.({
                    success: false,
                    message: 'Valid recipient is required.'
                });
            }

            const recipient = await User.findById(receiver);

            if (!recipient) {
                return callback?.({
                    success: false,
                    message: 'Recipient not found.'
                });
            }

            messageData.receiver = recipient._id;
        }

        // Group message validation
        if (messageType === 'group') {
            if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
                return callback?.({
                    success: false,
                    message: 'Valid group ID is required.'
                });
            }

            const group = await Group.findOne({
                _id: groupId,
                members: socket.user._id
            });

            if (!group) {
                return callback?.({
                    success: false,
                    message: 'You are not a member of this group.'
                });
            }

            messageData.groupId = group._id;
        }

        // Save message to MongoDB
        const message = await Message.create(messageData);

        console.log('Message saved:', message._id);

        callback?.({
            success: true,
            message: 'Message sent successfully.',
            data: message
        });

        // MongoDB Change Stream handles broadcasting.
        // Do not emit new_message here.

    } catch (error) {
        console.error('Send message error:', error);

        callback?.({
            success: false,
            message: 'Unable to send message.'
        });
    }
});

    // 5. Disconnect
    socket.on('disconnect', () => {
        console.log(`${socket.user.username} disconnected`);
    });
});

    // 7. MongoDB Change Stream
    const messageStream = Message.watch([], {
        fullDocument: 'updateLookup'
    });

    messageStream.on('change', (change) => {

        if (change.operationType !== 'insert') {
            return;
        }

        const message = change.fullDocument;

        if (message.messageType === 'private') {

            // Deliver to sender and recipient
            io.to(`user:${message.sender}`).emit(
                'new_message',
                message
            );

            io.to(`user:${message.receiver}`).emit(
                'new_message',
                message
            );

        } else if (message.messageType === 'group') {

            // Deliver to group members
            io.to(`group:${message.groupId}`).emit(
                'new_message',
                message
            );
        }
    });

    messageStream.on('error', (error) => {
        console.error('MongoDB Change Stream error:', error.message);
    });

    return io;
};

// 8. Export
export default initializeSocket;