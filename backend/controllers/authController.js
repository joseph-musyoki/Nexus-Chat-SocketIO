// 1. Imports
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Readable } from 'stream';

import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// Upload image to Cloudinary
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'nexus-chat/profiles',
                transformation: [
                    { width: 400, height: 400, crop: 'fill' }
                ]
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        Readable.from(buffer).pipe(stream);
    });
};
// Register Controller
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Username, email and password are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters'
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'Username or email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        let profilePicture = '';

        if (req.file) {
            const uploadedImage = await uploadToCloudinary(
                req.file.buffer
            );

            profilePicture = uploadedImage.secure_url;
        }

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            profilePicture
        });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        return res.status(500).json({
            message: 'Registration failed'
        });
    }
};

// 3. Login Controller
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Login failed',
            error: error.message
        });
    }
};