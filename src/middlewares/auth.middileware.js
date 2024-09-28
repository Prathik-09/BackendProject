import { ApiError } from "../utilities/ApiError.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from '../models/User.js'; // Ensure this is correctly imported

export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
       

        if (!token) {
            throw new ApiError(401, "No token provided");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
        if (!user) {
            throw new ApiError(401, "Invalid token");
        }

        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error); // Log the error
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});

