import { app } from "./app.js";
import connectDB from "./db/index.js";
import Dotenv from 'dotenv';

Dotenv.config({
    path:'./env'
})
connectDB()

.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
    .catch((err) => {
        console.error(`Error connecting to the database: ${err.message}`);
        process.exit(1);
    });