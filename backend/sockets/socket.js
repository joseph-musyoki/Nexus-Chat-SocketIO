// 1. Imports
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

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

        // Join personal room
        socket.join(`user:${userId}`);

        // Join rooms for groups the user belongs to
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

        // 5. Send Message
        socket.on('send_message', async (data, callback) => {
            try {
                const {
                    receiver,
                    groupId,
                    content,
                    messageType
                } = data;

                if (
                    typeof content !== 'string' ||
                    !content.trim() ||
                    content.length > 5000
                ) {
                    return callback?.({
                        success: false,
                        message: 'Invalid message content'
                    });
                }

                if (!['private', 'group'].includes(messageType)) {
                    return callback?.({
                        success: false,
                        message: 'Invalid message type'
                    });
                }

                const messageData = {
                    sender: socket.user._id,
                    content: content.trim(),
                    messageType
                };

                if (messageType === 'private') {

                    if (!receiver) {
                        return callback?.({
                            success: false,
                            message: 'Recipient is required'
                        });
                    }

                    const recipient = await User.findById(receiver);

                    if (!recipient) {
                        return callback?.({
                            success: false,
                            message: 'Recipient not found'
                        });
                    }

                    messageData.receiver = recipient._id;

                } else {

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

                    messageData.groupId = group._id;
                }

                const message = await Message.create(messageData);

                callback?.({
                    success: true,
                    message: 'Message saved successfully',
                    data: message
                });

            } catch (error) {
                console.error('Message error:', error.message);

                callback?.({
                    success: false,
                    message: 'Failed to send message'
                });
            }
        });

        // 6. Disconnect
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