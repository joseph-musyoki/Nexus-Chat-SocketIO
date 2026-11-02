// 1. Imports
import Group from '../models/Group.js';

// 2. Create Group
export const createGroup = async (req, res) => {
    try {
        const { name, description, members } = req.body;

        const groupMembers = [
            ...new Set([
                ... (members || []).map(id => id.toString()),
                req.user._id.toString()
            ])
        ];

        const group = await Group.create({
            name,
            description,
            members: groupMembers,
            createdBy: req.user._id
        });

        return res.status(201).json({
            message: 'Group created successfully',
            group
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create group'
        });
    }
};

// 3. Get User Groups
export const getGroups = async (req, res) => {
    try {
        const groups = await Group.find({
            members: req.user._id
        })
            .populate('members', 'username email profilePicture')
            .populate('createdBy', 'username');

        return res.status(200).json({
            groups
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve groups'
        });
    }
};