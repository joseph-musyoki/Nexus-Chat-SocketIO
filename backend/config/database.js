import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);

        console.log('MongoDB connected successfully!');
        console.log(`Database Host: ${connection.connection.host}`);
        console.log(`Database Name: ${connection.connection.name}`);

    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;