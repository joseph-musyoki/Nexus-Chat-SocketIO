// 1. Imports
import User from '../models/User.js';

// 2. Get All Users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({
            _id: { $ne: req.user._id }
        }).select('-password');

        return res.status(200).json({
            users
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve users'
        });
    }
};