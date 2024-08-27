import mongoose from 'mongoose';
import {DB_NAME} from '../constants.js'

const connectDB = async () => {
    try {
        console.log('MONGODB_URI:', process.env.MONGODB_URI);  
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`\n MongoDB connected: ${connectionInstance.connection.host}/${DB_NAME}`);
    } catch (err) {
        console.error('Mongo connection error:', err);
        process.exit(1);
    }
};
export default connectDB;