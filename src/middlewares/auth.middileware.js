import { ApiError } from "../utilities/ApiError.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import jwt from "jsonwebtoken";
export const verifyJwt=asyncHandler(async (req, res, next) => {
    try{
        const token=req.cookies.accessToken || req.header("Authorization")?.replace("Bearer","");

        if(!token){
            throw new ApiError()
        }
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        await User.findById(decodeToken?._id).select("-password -refreshToken");
        
        if(!user){
            throw new ApiError(401,"Invalid token")
        }
        req.user()=user;
        next();
    }
    catch(error){
        throw new ApiError(401,error?.message||"Invalid Access Token");
    }
   
})
