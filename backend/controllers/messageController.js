// 1. Imports
import mongoose from 'mongoose';

import Message from '../models/Message.js';
import User from '../models/User.js';
import Group from '../models/Group.js';

// 2. Retrieve Private Messages
export const getPrivateMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        const recipient = await User.findById(userId);

        if (!recipient) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 50)
        );

        const messages = await Message.find({
            messageType: 'private',
            $or: [
                {
                    sender: req.user._id,
                    receiver: userId
                },
                {
                    sender: userId,
                    receiver: req.user._id
                }
            ]
        })
            .populate('sender', 'username profilePicture')
            .populate('receiver', 'username profilePicture')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Message.countDocuments({
            messageType: 'private',
            $or: [
                {
                    sender: req.user._id,
                    receiver: userId
                },
                {
                    sender: userId,
                    receiver: req.user._id
                }
            ]
        });

        return res.status(200).json({
            messages: messages.reverse(),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Private message retrieval error:', error.message);

        return res.status(500).json({
            message: 'Failed to retrieve private messages'
        });
    }
};

// 3. Retrieve Group Messages
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        if (!mongoose.isValidObjectId(groupId)) {
            return res.status(400).json({
                message: 'Invalid group ID'
            });
        }

        const group = await Group.findOne({
            _id: groupId,
            members: req.user._id
        });

        if (!group) {
            return res.status(404).json({
                message: 'Group not found or access denied'
            });
        }

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 50)
        );

        const filter = {
            messageType: 'group',
            groupId
        };

        const messages = await Message.find(filter)
            .populate('sender', 'username profilePicture')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Message.countDocuments(filter);

        return res.status(200).json({
            messages: messages.reverse(),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Group message retrieval error:', error.message);

        return res.status(500).json({
            message: 'Failed to retrieve group messages'
        });
    }
};