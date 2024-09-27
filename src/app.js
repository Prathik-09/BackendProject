import express, { response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app=express();


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"));
app.use(cookieParser())

//rotes import
import userRouter from './routers/user.routes.js';
//route decleration
app.use("/api/v1/users",userRouter)

export {app}