import connectDB from "./db/index.js";
import Dotenv from 'dotenv';

Dotenv.config({
    path:'./env'
})
connectDB();